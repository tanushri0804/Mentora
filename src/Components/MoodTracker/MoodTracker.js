import React, { useMemo, useState, useEffect, useRef } from "react";
import './MoodTracker.css';
import { moodService } from '../../services/moodService';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// ─── QUIZ ──────────────────────────────────────────────────────────────────
const QUESTIONS = [
  {
    q: "How are you feeling right now, overall?",
    options: [
      { text: "😄 Really good!", score: 4 },
      { text: "🙂 Pretty okay", score: 3 },
      { text: "😐 Meh, just existing", score: 2 },
      { text: "😔 Not great at all", score: 1 },
      { text: "😢 Really struggling", score: 0 },
    ],
  },
  {
    q: "How was your energy today?",
    options: [
      { text: "⚡ Full of energy", score: 4 },
      { text: "🔋 Decent, a bit tired", score: 3 },
      { text: "😴 Pretty drained", score: 2 },
      { text: "🪫 Running on empty", score: 1 },
    ],
  },
  {
    q: "How's your mind feeling?",
    options: [
      { text: "✨ Clear and focused", score: 4 },
      { text: "💭 A little cloudy", score: 3 },
      { text: "🌀 Quite scattered", score: 2 },
      { text: "🌩️ Overwhelmed", score: 1 },
    ],
  },
  {
    q: "Did you feel connected to people today?",
    options: [
      { text: "🤗 Yes, felt supported", score: 4 },
      { text: "👋 A little", score: 3 },
      { text: "🙈 Not really", score: 2 },
      { text: "🏝️ Totally isolated", score: 1 },
    ],
  },
  {
    q: "Any tension or stress in your body?",
    options: [
      { text: "🌿 Nope, feeling calm", score: 4 },
      { text: "😤 Slight tension", score: 3 },
      { text: "💢 Quite tense", score: 2 },
      { text: "🔥 Very stressed out", score: 1 },
    ],
  },
];

// ─── MOOD LEVELS ───────────────────────────────────────────────────────────
const getMoodLevel = (score) => {
  const pct = score / 20;
  if (pct >= 0.85) return "thriving";
  if (pct >= 0.65) return "good";
  if (pct >= 0.45) return "okay";
  if (pct >= 0.25) return "low";
  return "struggling";
};

const MOOD_META = {
  thriving: { label: "Thriving 🌟", color: "#2a9d8f", bg: "rgba(42,157,143,0.12)", desc: "You're in a great headspace! Let's keep the momentum going." },
  good: { label: "Good 😊", color: "#4caf7d", bg: "rgba(76,175,125,0.12)", desc: "You're doing well. A little fun and reflection will make today even better." },
  okay: { label: "Okay 😐", color: "#f4a261", bg: "rgba(244,162,97,0.12)", desc: "You're holding steady. Let's gently boost your mood step by step." },
  low: { label: "Low 😔", color: "#e07a5f", bg: "rgba(224,122,95,0.12)", desc: "You're feeling a bit down. That's okay — we'll take it slow and easy." },
  struggling: { label: "Struggling 💙", color: "#457b9d", bg: "rgba(69,123,157,0.12)", desc: "It's okay not to be okay. Let's take this one gentle step at a time." },
};

// ─── 5-STEP PLANS ── Each mood level has a completely unique set of activities ──
const PLANS = {
  // Energetic & celebratory: word game → memory challenge → big gratitude →  creative journal → inspiring quote
  thriving: [
    { type: "wordscramble", icon: "🔤", title: "Word Challenge", desc: "Warm up that sharp brain of yours!" },
    { type: "memorymatch", icon: "🃏", title: "Memory Match", desc: "Test your focus with a card-matching game." },
    { type: "gratitude", icon: "🙏", title: "Gratitude Boost", desc: "Write 3 amazing things happening in your life." },
    { type: "journal", icon: "📝", title: "Creative Journal", desc: "Capture what's making you thrive right now." },
    { type: "quote", icon: "💬", title: "Power Quote", desc: "Take a high-vibe message into your day." },
  ],
  // Positive but could use a spark: affirmation → fun game → reframe → gratitude → quote
  good: [
    { type: "affirmation", icon: "✨", title: "Morning Affirmation", desc: "Start with a truth that fuels your energy." },
    { type: "tictactoe", icon: "🎮", title: "Quick Game", desc: "Beat the CPU — you've got this!" },
    { type: "reframe", icon: "🔄", title: "Positive Reframe", desc: "Turn a small worry into a growth moment." },
    { type: "gratitude", icon: "🙏", title: "Gratitude Check-in", desc: "List 3 things you genuinely appreciate." },
    { type: "quote", icon: "💬", title: "Quote of the Day", desc: "Wrap up with wisdom to carry forward." },
  ],
  // Middle ground: breathing → reframe → word puzzle → gratitude → journal
  okay: [
    { type: "breathing", icon: "🫁", title: "Grounding Breath", desc: "Reset your system with calming breath." },
    { type: "reframe", icon: "🔄", title: "Thought Reframe", desc: "Flip one heavy thought into something lighter." },
    { type: "wordscramble", icon: "🔤", title: "Word Scramble", desc: "Give your mind a fun little puzzle." },
    { type: "gratitude", icon: "🙏", title: "Silver Linings", desc: "Find 3 small things to be thankful for." },
    { type: "journal", icon: "📝", title: "Feelings Journal", desc: "Write freely — no judgment, just flow." },
  ],
  // Feeling down: breathing → compassion affirmation → journaling → memory game → healing quote
  low: [
    { type: "breathing", icon: "🫁", title: "Calm Breathing", desc: "Let's slow things down and breathe first." },
    { type: "affirmation", icon: "✨", title: "Self-Compassion", desc: "You deserve your own kindness today." },
    { type: "journal", icon: "📝", title: "Heart Journal", desc: "Get it out — write whatever you feel." },
    { type: "memorymatch", icon: "🃏", title: "Gentle Focus Game", desc: "A light game to quietly redirect your mind." },
    { type: "quote", icon: "💬", title: "Healing Words", desc: "Close with words that feel like a warm hug." },
  ],
  // Struggling: breathe → breathe again → journal → reframe → gratitude
  struggling: [
    { type: "breathing", icon: "🫁", title: "Safety Breath", desc: "You are safe. Let's just breathe together." },
    { type: "breathing", icon: "🫁", title: "Deeper Breath", desc: "One more round — slower and longer this time." },
    { type: "journal", icon: "📝", title: "Vent Freely", desc: "No filter. Write everything you're feeling." },
    { type: "reframe", icon: "🔄", title: "One Tiny Reframe", desc: "Let's find one small shift in perspective." },
    { type: "gratitude", icon: "🙏", title: "One Good Thing", desc: "Just one. Even the smallest thing counts." },
  ],
};

// ─── CONTENT DATA ──────────────────────────────────────────────────────────
const AFFIRMATIONS = [
  "I am capable of handling whatever comes my way.",
  "I choose peace over anxiety today.",
  "My feelings are valid, and I am learning to work through them.",
  "I deserve kindness — especially from myself.",
  "Small steps still move me forward.",
  "I am becoming a stronger version of myself every day.",
  "Today I give myself permission to simply be.",
];

const QUOTES = [
  { text: "You don't have to be positive all the time. It's perfectly okay to feel sad, angry, annoyed, frustrated, or downright sad.", author: "Lori Deschene" },
  { text: "Almost everything will work again if you unplug it for a few minutes — including you.", author: "Anne Lamott" },
  { text: "You are allowed to be both a masterpiece and a work in progress simultaneously.", author: "Sophia Bush" },
  { text: "There is hope, even when your brain tells you there isn't.", author: "John Green" },
  { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
  { text: "Be gentle with yourself. You are a child of the universe.", author: "Max Ehrmann" },
];

const WORD_SCRAMBLES = [
  { scrambled: "ACEEP", answer: "PEACE" },
  { scrambled: "LFJUYO", answer: "JOYFUL" },
  { scrambled: "EABRTEH", answer: "BREATHE" },
  { scrambled: "CLSAMNES", answer: "CALMNESS" },
  { scrambled: "ENIPCATE", answer: "PATIENCE" },
  { scrambled: "TIHGELD", answer: "DELIGHT" },
  { scrambled: "TEGHTSNR", answer: "STRENGTH" },
  { scrambled: "TIURATGED", answer: "GRATITUDE" },
];

const JOURNAL_PROMPTS = {
  thriving: "What's been the highlight of your day so far? Let yourself celebrate it.",
  good: "Describe something you're looking forward to in the next few days.",
  okay: "What's one thing that felt heavy today? Write it out without judgment.",
  low: "What does your heart want to say right now? Let it all out here.",
  struggling: "You don't have to be okay. Write exactly how you feel — no filter, no judgment.",
};

const REFRAME_PROMPTS = [
  { negative: "I always mess things up.", positive: "I am learning and growing through my mistakes." },
  { negative: "Nobody cares about me.", positive: "I am reaching out and building connection." },
  { negative: "I can't handle this.", positive: "This is hard, but I've handled hard things before." },
  { negative: "I'll never feel better.", positive: "This feeling is temporary. Change is always possible." },
  { negative: "I'm not good enough.", positive: "I am enough exactly as I am, right now." },
  { negative: "Everything is going wrong.", positive: "Some things are hard, and I can handle them one at a time." },
];

const MEMORY_EMOJIS = ["🌈", "⚡", "🌙", "🎨", "🌿", "💎", "🔥", "🌸"];

const QUICK_GAMES = [
  // ── Wellness ──
  { id: "breathing", emoji: "🌬️", title: "Breathing Exercise", desc: "4-7-8 calm breathing cycles", color: "#2a9d8f", tags: ["Wellness", "Calm"] },
  { id: "affirmation", emoji: "✨", title: "Daily Affirmation", desc: "A positive card just for you", color: "#f4a261", tags: ["Wellness", "Mood"] },
  { id: "gratitude", emoji: "🙏", title: "Gratitude Prompt", desc: "Write three things you're thankful for", color: "#4caf7d", tags: ["Wellness", "Mood"] },
  { id: "reframe", emoji: "🔄", title: "Positive Reframe", desc: "Flip a negative thought into a positive one", color: "#9b59b6", tags: ["Wellness", "Calm"] },
  { id: "quote", emoji: "💬", title: "Inspire Me", desc: "A motivational quote to lift your spirit", color: "#457b9d", tags: ["Wellness", "Mood"] },
  // ── Games ──
  { id: "tictactoe", emoji: "🎮", title: "Tic Tac Toe", desc: "Classic strategy vs CPU", color: "#f4a261", tags: ["Games", "Strategy"] },
  { id: "memorymatch", emoji: "🃏", title: "Memory Match", desc: "Find all matching pairs", color: "#9b59b6", tags: ["Games", "Memory"] },
  { id: "wordscramble", emoji: "🔤", title: "Word Scramble", desc: "Unscramble the hidden word", color: "#4ecdc4", tags: ["Games", "Words"] },
  { id: "hangman", emoji: "🎯", title: "Hangman", desc: "Guess the hidden word", color: "#f4a261", tags: ["Games", "Words"] },
  { id: "simon", emoji: "🎵", title: "Pattern Blast", desc: "Repeat the color sequence", color: "#2a9d8f", tags: ["Games", "Memory"] },
  { id: "reaction", emoji: "⚡", title: "Reaction Tap", desc: "Tap when the screen turns green", color: "#4caf7d", tags: ["Games", "Speed"] },
  { id: "bubblepop", emoji: "🫧", title: "Bubble Pop", desc: "Pop as many as you can in 30s", color: "#4ecdc4", tags: ["Games", "Speed"] },
  { id: "colormatch", emoji: "🎨", title: "Color Match", desc: "Tap the right color fast", color: "#457b9d", tags: ["Games", "Speed"] },
  { id: "rps", emoji: "✊", title: "Rock Paper Scissors", desc: "Quick round against CPU", color: "#e07a5f", tags: ["Games", "Party"] },
  { id: "dice", emoji: "🎲", title: "Dice Battle", desc: "Roll higher than the CPU", color: "#9b59b6", tags: ["Games", "Party"] },
];

const SIMON_PADS = [
  { id: 0, hex: "#2a9d8f" },
  { id: 1, hex: "#e07a5f" },
  { id: 2, hex: "#f4a261" },
  { id: 3, hex: "#9b59b6" },
];

const HANGMAN_WORDS = ["CALM", "PEACE", "JOY", "BRAVE", "FOCUS", "HAPPY", "DREAM", "SMILE", "RELAX", "LIGHT", "HOPE", "BLISS"];
const HANGMAN_STAGES = ["", "😊", "🙂", "😐", "😬", "😰", "😵", "💫"];

const RPS_CHOICES = [
  { id: "rock", emoji: "🪨", label: "Rock" },
  { id: "paper", emoji: "📄", label: "Paper" },
  { id: "scissors", emoji: "✂️", label: "Scissors" },
];

const CALM_COLORS = [
  { name: "Teal", hex: "#2a9d8f" },
  { name: "Coral", hex: "#e07a5f" },
  { name: "Gold", hex: "#f4a261" },
  { name: "Lavender", hex: "#9b59b6" },
  { name: "Mint", hex: "#4caf7d" },
  { name: "Sky", hex: "#4ecdc4" },
];

// ─── ACTIVITY COMPONENTS ──────────────────────────────────────────────────

const BreathingExercise = ({ onDone, exitLabel = "Feeling better ✓" }) => {
  const [phase, setPhase] = useState("ready"); // ready | inhale | hold | exhale | done
  const [count, setCount] = useState(0);
  const [cycles, setCycles] = useState(0);
  const TOTAL_CYCLES = 3;

  useEffect(() => {
    if (phase === "ready") return;
    const phaseDurations = { inhale: 4, hold: 4, exhale: 6 };
    const next = { inhale: "hold", hold: "exhale", exhale: "inhale" };
    setCount(phaseDurations[phase]);
    const interval = setInterval(() => {
      setCount(c => {
        if (c <= 1) {
          clearInterval(interval);
          if (phase === "exhale") {
            const newCycles = cycles + 1;
            setCycles(newCycles);
            if (newCycles >= TOTAL_CYCLES) { setPhase("done"); return 0; }
          }
          setPhase(p => next[p]);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const phaseInfo = {
    ready: { label: "Ready?", color: "#2a9d8f", scale: 1 },
    inhale: { label: "Inhale", color: "#2a9d8f", scale: 1.3 },
    hold: { label: "Hold", color: "#f4a261", scale: 1.3 },
    exhale: { label: "Exhale", color: "#457b9d", scale: 1 },
    done: { label: "Done ✓", color: "#4caf7d", scale: 1 },
  };
  const p = phaseInfo[phase];

  return (
    <div className="activity-center">
      <p className="activity-subtitle">3 rounds of box breathing to center yourself</p>
      <div className="breath-circle-wrap">
        <div className="breath-circle" style={{ transform: `scale(${p.scale})`, borderColor: p.color, boxShadow: `0 0 40px ${p.color}40` }}>
          <span className="breath-label" style={{ color: p.color }}>{p.label}</span>
          {phase !== "ready" && phase !== "done" && <span className="breath-count">{count}s</span>}
          {phase === "done" && <span className="breath-count" style={{ fontSize: "2rem" }}>😌</span>}
        </div>
      </div>
      <div className="breath-cycles">Round {Math.min(cycles + 1, TOTAL_CYCLES)} of {TOTAL_CYCLES}</div>
      {phase === "ready" && (
        <button className="activity-btn" onClick={() => setPhase("inhale")}>Start Breathing</button>
      )}
      {phase === "done" && (
        <button type="button" className="activity-btn" onClick={onDone}>{exitLabel}</button>
      )}
    </div>
  );
};

const AffirmationCard = ({ onDone, exitLabel = "I needed that ✓" }) => {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * AFFIRMATIONS.length));
  const [flipped, setFlipped] = useState(false);
  return (
    <div className="activity-center">
      <p className="activity-subtitle">Read this slowly and let it sink in.</p>
      <div className={`affirmation-card ${flipped ? "flipped" : ""}`} onClick={() => setFlipped(!flipped)}>
        <div className="affirmation-front">
          <span style={{ fontSize: "3rem" }}>✨</span>
          <p>Tap to reveal your affirmation</p>
        </div>
        <div className="affirmation-back">
          <p>"{AFFIRMATIONS[idx]}"</p>
        </div>
      </div>
      {flipped && (
        <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
          <button className="activity-btn-outline" onClick={() => { setIdx((idx + 1) % AFFIRMATIONS.length); setFlipped(false); }}>New one</button>
          <button type="button" className="activity-btn" onClick={onDone}>{exitLabel}</button>
        </div>
      )}
    </div>
  );
};

const GratitudePrompt = ({ onDone, exitLabel }) => {
  const [items, setItems] = useState(["", "", ""]);
  const filled = items.filter(i => i.trim()).length;
  return (
    <div className="activity-center" style={{ width: "100%" }}>
      <p className="activity-subtitle">Write 3 things you're grateful for right now — big or tiny.</p>
      <div className="gratitude-list">
        {items.map((val, i) => (
          <div key={i} className="gratitude-row">
            <span className="gratitude-num">{i + 1}</span>
            <input
              className="gratitude-input"
              placeholder={["Something that made you smile...", "Someone who helped you...", "Something easy to overlook..."][i]}
              value={val}
              onChange={e => { const n = [...items]; n[i] = e.target.value; setItems(n); }}
            />
          </div>
        ))}
      </div>
      <button type="button" className="activity-btn" disabled={filled < 1} onClick={onDone} style={{ marginTop: "1.5rem" }}>
        {exitLabel || (filled >= 3 ? "Beautiful! Continue ✓" : filled > 0 ? `${filled}/3 — Continue anyway` : "Write at least one...")}
      </button>
    </div>
  );
};

const TicTacToe = ({ onDone, standalone = false, exitLabel = "Done playing ✓" }) => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [winner, setWinner] = useState(null);
  const [isX, setIsX] = useState(true);

  const calcWinner = (sq) => {
    const lines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
    for (let l of lines) if (sq[l[0]] && sq[l[0]] === sq[l[1]] && sq[l[0]] === sq[l[2]]) return sq[l[0]];
    return null;
  };

  const cpuMove = (b) => {
    const empties = b.map((v, i) => v === null ? i : null).filter(v => v !== null);
    if (!empties.length) return;
    const newB = [...b];
    newB[empties[Math.floor(Math.random() * empties.length)]] = "O";
    setBoard(newB);
    const w = calcWinner(newB);
    if (w) setWinner(w);
    else if (!newB.includes(null)) setWinner("Draw");
    else setIsX(true);
  };

  const handleClick = (i) => {
    if (board[i] || winner || !isX) return;
    const newB = [...board]; newB[i] = "X";
    setBoard(newB);
    const w = calcWinner(newB);
    if (w) { setWinner(w); return; }
    if (!newB.includes(null)) { setWinner("Draw"); return; }
    setIsX(false);
    setTimeout(() => cpuMove(newB), 500);
  };

  const reset = () => { setBoard(Array(9).fill(null)); setWinner(null); setIsX(true); };

  return (
    <div className={`activity-center game-activity ${standalone ? "game-activity--standalone" : ""}`}>
      {!standalone && <p className="activity-subtitle">A quick game against the computer. You're X!</p>}
      <div className={`ttt-status-pill ${winner ? "ttt-status-pill--result" : ""}`}>
        {winner
          ? (winner === "Draw" ? "It's a Draw! 🤝" : winner === "X" ? "You won! 🎉" : "CPU wins! 🤖")
          : (isX ? "Your turn — you're X" : "CPU is thinking...")}
      </div>
      <div className={`ttt-grid ${standalone ? "ttt-grid--play" : ""}`}>
        {board.map((s, i) => (
          <button
            key={i}
            className={`ttt-sq ${s?.toLowerCase() || "empty"}`}
            onClick={() => handleClick(i)}
            disabled={!!s || !!winner || !isX}
            aria-label={s ? `Cell ${s}` : "Empty cell"}
          >
            <span className="ttt-mark">{s || ""}</span>
          </button>
        ))}
      </div>
      <div className="game-actions">
        <button type="button" className="activity-btn-outline" onClick={reset}>Play again</button>
        <button type="button" className="activity-btn" onClick={onDone}>{exitLabel}</button>
      </div>
    </div>
  );
};

const QuoteCard = ({ onDone }) => {
  const [q] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  return (
    <div className="activity-center">
      <p className="activity-subtitle">Carry these words with you today.</p>
      <div className="quote-display">
        <span className="quote-mark">"</span>
        <p className="quote-body">{q.text}</p>
        <span className="quote-author">— {q.author}</span>
      </div>
      <button className="activity-btn" onClick={onDone} style={{ marginTop: "1.5rem" }}>Complete Session ✓</button>
    </div>
  );
};

const WordScramble = ({ onDone, exitLabel = "Continue ✓" }) => {
  const [wIdx] = useState(() => Math.floor(Math.random() * WORD_SCRAMBLES.length));
  const { scrambled, answer } = WORD_SCRAMBLES[wIdx];
  const [guess, setGuess] = useState("");
  const [solved, setSolved] = useState(false);
  const [tries, setTries] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const check = () => {
    setTries(t => t + 1);
    if (guess.trim().toUpperCase() === answer) setSolved(true);
  };

  return (
    <div className="activity-center">
      <p className="activity-subtitle">Unscramble the letters to find the word!</p>
      <div className="scramble-tiles">
        {scrambled.split("").map((ch, i) => <span key={i} className="scramble-tile">{ch}</span>)}
      </div>
      {!solved && !revealed ? (
        <>
          <div className="scramble-input-row">
            <input
              className="gratitude-input"
              placeholder="Your answer..."
              value={guess}
              onChange={e => setGuess(e.target.value)}
              onKeyDown={e => e.key === "Enter" && check()}
              style={{ maxWidth: 220 }}
            />
            <button className="activity-btn" onClick={check}>Check</button>
          </div>
          {tries > 0 && <p style={{ color: "#e07a5f", marginTop: "0.5rem" }}>Not quite! Try again 🔄</p>}
          {tries >= 3 && <button className="activity-btn-outline" style={{ marginTop: "0.5rem" }} onClick={() => setRevealed(true)}>Reveal Answer</button>}
        </>
      ) : (
        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <p style={{ color: solved ? "#4caf7d" : "#f4a261", fontSize: "1.3rem", fontWeight: 700 }}>
            {solved ? `✓ "${answer}" — Well done!` : `The answer was: "${answer}"`}
          </p>
          <button type="button" className="activity-btn" onClick={onDone} style={{ marginTop: "1rem" }}>{exitLabel}</button>
        </div>
      )}
    </div>
  );
};

// ─── JOURNAL ─────────────────────────────────────────────────────────────
const JournalActivity = ({ moodLevel, onDone }) => {
  const prompt = JOURNAL_PROMPTS[moodLevel] || JOURNAL_PROMPTS.okay;
  const [text, setText] = useState("");
  return (
    <div className="activity-center" style={{ width: "100%" }}>
      <div className="journal-prompt-bubble">
        <span style={{ fontSize: "1.4rem" }}>📝</span>
        <p>{prompt}</p>
      </div>
      <textarea
        className="journal-textarea"
        placeholder="Start writing here... this is just for you."
        value={text}
        onChange={e => setText(e.target.value)}
        rows={6}
      />
      <div style={{ display: "flex", gap: "1rem", alignItems: "center", width: "100%", justifyContent: "space-between" }}>
        <span className="journal-char-count">{text.length} characters</span>
        <button className="activity-btn" onClick={onDone}>
          {text.length > 10 ? "That felt good ✓" : "Skip for now"}
        </button>
      </div>
    </div>
  );
};

// ─── POSITIVE REFRAME ─────────────────────────────────────────────────────
const ReframeActivity = ({ onDone }) => {
  const [idx] = useState(() => Math.floor(Math.random() * REFRAME_PROMPTS.length));
  const { negative, positive } = REFRAME_PROMPTS[idx];
  const [step, setStep] = useState("show_negative"); // show_negative | show_positive | write | done
  const [userReframe, setUserReframe] = useState("");

  return (
    <div className="activity-center" style={{ width: "100%" }}>
      {step === "show_negative" && (
        <>
          <p className="activity-subtitle">A common negative thought pattern:</p>
          <div className="reframe-box negative">"{negative}"</div>
          <p style={{ color: "#6b7280", fontSize: "0.85rem", textAlign: "center" }}>
            Sound familiar? Let's gently flip this around.
          </p>
          <button className="activity-btn" onClick={() => setStep("show_positive")}>See the reframe →</button>
        </>
      )}
      {step === "show_positive" && (
        <>
          <p className="activity-subtitle">Here's a healthier way to see it:</p>
          <div className="reframe-box negative" style={{ opacity: 0.4, fontSize: "0.85rem" }}>"{negative}"</div>
          <div className="reframe-arrow">↓</div>
          <div className="reframe-box positive">"{positive}"</div>
          <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
            <button className="activity-btn-outline" onClick={() => setStep("write")}>Write your own</button>
            <button className="activity-btn" onClick={onDone}>Got it ✓</button>
          </div>
        </>
      )}
      {step === "write" && (
        <>
          <p className="activity-subtitle">Now write YOUR own positive version of this thought:</p>
          <div className="reframe-box negative" style={{ opacity: 0.4, fontSize: "0.85rem" }}>"{negative}"</div>
          <textarea
            className="journal-textarea"
            placeholder="I am..."
            value={userReframe}
            onChange={e => setUserReframe(e.target.value)}
            rows={3}
            style={{ marginTop: "0.5rem" }}
          />
          <button className="activity-btn" onClick={onDone} disabled={userReframe.trim().length < 3}>
            That's my truth ✓
          </button>
        </>
      )}
    </div>
  );
};

// ─── MEMORY MATCH ─────────────────────────────────────────────────────────
const RockPaperScissors = ({ onDone, exitLabel = "Back to games" }) => {
  const [playerPick, setPlayerPick] = useState(null);
  const [cpuPick, setCpuPick] = useState(null);
  const [stats, setStats] = useState({ wins: 0, losses: 0, draws: 0 });

  const getWinner = (p, c) => {
    if (p === c) return "draw";
    if ((p === "rock" && c === "scissors") || (p === "paper" && c === "rock") || (p === "scissors" && c === "paper")) return "player";
    return "cpu";
  };

  const play = (pick) => {
    const cpu = RPS_CHOICES[Math.floor(Math.random() * RPS_CHOICES.length)].id;
    setPlayerPick(pick);
    setCpuPick(cpu);
    const outcome = getWinner(pick, cpu);
    setStats(s => ({
      wins: s.wins + (outcome === "player" ? 1 : 0),
      losses: s.losses + (outcome === "cpu" ? 1 : 0),
      draws: s.draws + (outcome === "draw" ? 1 : 0),
    }));
  };

  const outcome = playerPick && cpuPick ? getWinner(playerPick, cpuPick) : null;
  const pickMeta = (id) => RPS_CHOICES.find(c => c.id === id);

  return (
    <div className="activity-center game-activity game-activity--standalone">
      <div className="rps-scoreboard">
        <span>Wins <strong>{stats.wins}</strong></span>
        <span>Draws <strong>{stats.draws}</strong></span>
        <span>Losses <strong>{stats.losses}</strong></span>
      </div>
      {playerPick && cpuPick ? (
        <div className="rps-arena">
          <div className="rps-pick">
            <span className="rps-pick-label">You</span>
            <span className="rps-pick-emoji">{pickMeta(playerPick)?.emoji}</span>
          </div>
          <span className="rps-vs">VS</span>
          <div className="rps-pick">
            <span className="rps-pick-label">CPU</span>
            <span className="rps-pick-emoji">{pickMeta(cpuPick)?.emoji}</span>
          </div>
        </div>
      ) : (
        <p className="activity-subtitle">Pick rock, paper, or scissors to play.</p>
      )}
      {outcome && (
        <p className={`rps-result rps-result--${outcome}`}>
          {outcome === "player" ? "You win this round! 🎉" : outcome === "cpu" ? "CPU wins this round" : "It's a draw 🤝"}
        </p>
      )}
      <div className="rps-choices">
        {RPS_CHOICES.map(c => (
          <button key={c.id} type="button" className="rps-choice-btn" onClick={() => play(c.id)}>
            <span>{c.emoji}</span>
            <small>{c.label}</small>
          </button>
        ))}
      </div>
      <div className="game-actions">
        <button type="button" className="activity-btn-outline" onClick={() => { setPlayerPick(null); setCpuPick(null); }}>Clear round</button>
        <button type="button" className="activity-btn" onClick={onDone}>{exitLabel}</button>
      </div>
    </div>
  );
};

const ColorMatch = ({ onDone, exitLabel = "Back to games" }) => {
  const TOTAL_ROUNDS = 5;
  const [round, setRound] = useState(0);
  const [target, setTarget] = useState(null);
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [finished, setFinished] = useState(false);

  const startRound = () => {
    const shuffled = [...CALM_COLORS].sort(() => Math.random() - 0.5);
    const correct = shuffled[0];
    const picks = [correct, shuffled[1], shuffled[2], shuffled[3]].sort(() => Math.random() - 0.5);
    setTarget(correct);
    setOptions(picks);
    setFeedback(null);
  };

  useEffect(() => { startRound(); }, []);

  const handlePick = (color) => {
    if (feedback || finished) return;
    const correct = color.hex === target.hex;
    if (correct) setScore(s => s + 1);
    setFeedback(correct ? "correct" : "wrong");
    setTimeout(() => {
      if (round >= TOTAL_ROUNDS - 1) {
        setFinished(true);
      } else {
        setRound(r => r + 1);
        startRound();
      }
    }, 700);
  };

  if (finished) {
    return (
      <div className="activity-center game-activity game-activity--standalone">
        <div className="color-match-done">
          <span className="color-match-done-emoji">🎯</span>
          <h3>You scored {score} / {TOTAL_ROUNDS}</h3>
          <p>Nice focus — take a breath before your next game.</p>
        </div>
        <div className="game-actions">
          <button type="button" className="activity-btn-outline" onClick={() => { setRound(0); setScore(0); setFinished(false); startRound(); }}>Play again</button>
          <button type="button" className="activity-btn" onClick={onDone}>{exitLabel}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="activity-center game-activity game-activity--standalone">
      <p className="activity-subtitle">Tap the swatch that matches the color name.</p>
      <div className="color-match-header">
        <span className="color-match-round">Round {round + 1} / {TOTAL_ROUNDS}</span>
        <span className="color-match-score">Score: {score}</span>
      </div>
      <div className="color-match-prompt" style={{ borderColor: target?.hex }}>
        Match: <strong style={{ color: target?.hex }}>{target?.name}</strong>
      </div>
      <div className="color-match-grid">
        {options.map((c, i) => (
          <button
            key={`${c.hex}-${i}`}
            type="button"
            className={`color-match-swatch ${feedback && c.hex === target.hex ? "correct" : ""} ${feedback === "wrong" && c.hex !== target.hex ? "" : ""}`}
            style={{ background: c.hex }}
            onClick={() => handlePick(c)}
            disabled={!!feedback}
            aria-label={c.name}
          />
        ))}
      </div>
      {feedback && (
        <p className={`color-match-feedback color-match-feedback--${feedback}`}>
          {feedback === "correct" ? "Correct! ✓" : "Not quite — keep going"}
        </p>
      )}
      <button type="button" className="activity-btn-outline" onClick={onDone}>{exitLabel}</button>
    </div>
  );
};

const SimonSays = ({ onDone, exitLabel = "Back to games" }) => {
  const [sequence, setSequence] = useState([]);
  const [playerStep, setPlayerStep] = useState(0);
  const [level, setLevel] = useState(0);
  const [activePad, setActivePad] = useState(null);
  const [phase, setPhase] = useState("idle");
  const [best, setBest] = useState(0);
  const timersRef = useRef([]);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  useEffect(() => () => clearTimers(), []);

  const playSequence = (seq) => {
    setPhase("showing");
    setPlayerStep(0);
    let i = 0;
    const step = () => {
      if (i >= seq.length) {
        setActivePad(null);
        setPhase("input");
        return;
      }
      setActivePad(seq[i]);
      timersRef.current.push(setTimeout(() => {
        setActivePad(null);
        timersRef.current.push(setTimeout(() => { i += 1; step(); }, 180));
      }, 480));
    };
    step();
  };

  const startGame = () => {
    clearTimers();
    const first = [Math.floor(Math.random() * 4)];
    setSequence(first);
    setLevel(1);
    setBest(0);
    playSequence(first);
  };

  const handlePad = (id) => {
    if (phase !== "input") return;
    setActivePad(id);
    timersRef.current.push(setTimeout(() => setActivePad(null), 160));
    if (sequence[playerStep] !== id) {
      setPhase("gameover");
      setBest(b => Math.max(b, level - 1));
      return;
    }
    const next = playerStep + 1;
    if (next === sequence.length) {
      const newSeq = [...sequence, Math.floor(Math.random() * 4)];
      setSequence(newSeq);
      setLevel(l => l + 1);
      setBest(b => Math.max(b, level));
      setPhase("levelup");
      timersRef.current.push(setTimeout(() => playSequence(newSeq), 700));
    } else {
      setPlayerStep(next);
    }
  };

  return (
    <div className="activity-center game-activity game-activity--standalone">
      <div className="mini-game-hud">
        <span>Level <strong>{level || 1}</strong></span>
        <span>Best <strong>{best}</strong></span>
      </div>
      {phase === "idle" && <p className="activity-subtitle">Watch the pattern, then repeat it. Each level adds one more step!</p>}
      {phase === "gameover" && <p className="game-banner-msg game-banner-msg--lose">Game over — you reached level {Math.max(level, 1)}!</p>}
      {phase === "levelup" && <p className="game-banner-msg game-banner-msg--win">Level {level}! Keep going...</p>}
      <div className="simon-grid">
        {SIMON_PADS.map(pad => (
          <button
            key={pad.id}
            type="button"
            className={`simon-pad ${activePad === pad.id ? "simon-pad--lit" : ""}`}
            style={{ "--pad-color": pad.hex }}
            onClick={() => handlePad(pad.id)}
            disabled={phase !== "input"}
          />
        ))}
      </div>
      <div className="game-actions">
        {phase === "idle" || phase === "gameover" ? (
          <button type="button" className="activity-btn" onClick={startGame}>{phase === "gameover" ? "Try again" : "Start game"}</button>
        ) : (
          <button type="button" className="activity-btn-outline" disabled>Follow the pattern...</button>
        )}
        <button type="button" className="activity-btn-outline" onClick={onDone}>{exitLabel}</button>
      </div>
    </div>
  );
};

const BubblePop = ({ onDone, exitLabel = "Back to games" }) => {
  const [bubbles, setBubbles] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [playing, setPlaying] = useState(false);
  const [finished, setFinished] = useState(false);
  const idRef = useRef(0);

  useEffect(() => {
    if (!playing || finished) return;
    const clock = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setFinished(true);
          setPlaying(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(clock);
  }, [playing, finished]);

  useEffect(() => {
    if (!playing || finished) return;
    const spawner = setInterval(() => {
      idRef.current += 1;
      setBubbles(prev => [
        ...prev.slice(-14),
        {
          id: idRef.current,
          left: 8 + Math.random() * 72,
          size: 32 + Math.random() * 28,
          hue: Math.floor(Math.random() * 360),
        },
      ]);
    }, 550);
    const mover = setInterval(() => {
      setBubbles(prev => prev.map(b => ({ ...b, bottom: (b.bottom ?? -12) + 2.2 })).filter(b => (b.bottom ?? 0) < 108));
    }, 45);
    return () => { clearInterval(spawner); clearInterval(mover); };
  }, [playing, finished]);

  const start = () => {
    setBubbles([]);
    setScore(0);
    setTimeLeft(30);
    setFinished(false);
    setPlaying(true);
    idRef.current = 0;
  };

  const pop = (id) => {
    setBubbles(prev => prev.filter(b => b.id !== id));
    setScore(s => s + 1);
  };

  return (
    <div className="activity-center game-activity game-activity--standalone">
      <div className="mini-game-hud">
        <span>Score <strong>{score}</strong></span>
        <span>Time <strong>{playing ? `${timeLeft}s` : finished ? "0s" : "30s"}</strong></span>
      </div>
      {!playing && !finished && <p className="activity-subtitle">Pop floating bubbles before they drift away. You have 30 seconds!</p>}
      {finished && <p className="game-banner-msg game-banner-msg--win">Time! You popped {score} bubbles 🫧</p>}
      <div className="bubble-arena">
        {bubbles.map(b => (
          <button
            key={b.id}
            type="button"
            className="bubble-item"
            style={{
              left: `${b.left}%`,
              bottom: `${b.bottom ?? -12}%`,
              width: b.size,
              height: b.size,
              background: `hsla(${b.hue}, 70%, 55%, 0.55)`,
              boxShadow: `0 0 20px hsla(${b.hue}, 70%, 55%, 0.35)`,
            }}
            onClick={() => pop(b.id)}
            disabled={!playing}
            aria-label="Pop bubble"
          />
        ))}
        {!playing && bubbles.length === 0 && <span className="bubble-arena-hint">Bubbles appear here</span>}
      </div>
      <div className="game-actions">
        {!playing ? (
          <button type="button" className="activity-btn" onClick={start}>{finished ? "Play again" : "Start popping"}</button>
        ) : null}
        <button type="button" className="activity-btn-outline" onClick={onDone}>{exitLabel}</button>
      </div>
    </div>
  );
};

const ReactionTap = ({ onDone, exitLabel = "Back to games" }) => {
  const [phase, setPhase] = useState("idle");
  const [reactionMs, setReactionMs] = useState(null);
  const [best, setBest] = useState(null);
  const [rounds, setRounds] = useState([]);
  const startRef = useRef(0);
  const waitRef = useRef(null);

  useEffect(() => () => { if (waitRef.current) clearTimeout(waitRef.current); }, []);

  const startRound = () => {
    if (waitRef.current) clearTimeout(waitRef.current);
    setReactionMs(null);
    setPhase("waiting");
    waitRef.current = setTimeout(() => {
      startRef.current = Date.now();
      setPhase("go");
    }, 1200 + Math.random() * 2800);
  };

  const handleTap = () => {
    if (phase === "idle") startRound();
    else if (phase === "waiting") {
      if (waitRef.current) clearTimeout(waitRef.current);
      setPhase("early");
    } else if (phase === "go") {
      const ms = Date.now() - startRef.current;
      setReactionMs(ms);
      setBest(b => (b === null ? ms : Math.min(b, ms)));
      setRounds(r => [...r, ms]);
      setPhase("result");
    } else if (phase === "early" || phase === "result") {
      startRound();
    }
  };

  const avg = rounds.length ? Math.round(rounds.reduce((a, b) => a + b, 0) / rounds.length) : null;

  return (
    <div className="activity-center game-activity game-activity--standalone">
      <div className="mini-game-hud">
        <span>Best <strong>{best !== null ? `${best}ms` : "—"}</strong></span>
        <span>Avg <strong>{avg !== null ? `${avg}ms` : "—"}</strong></span>
      </div>
      <button
        type="button"
        className={`reaction-zone reaction-zone--${phase}`}
        onClick={handleTap}
      >
        {phase === "idle" && <span>Tap to start</span>}
        {phase === "waiting" && <span>Wait for green...</span>}
        {phase === "go" && <span>TAP NOW!</span>}
        {phase === "early" && <span>Too soon! Tap to retry</span>}
        {phase === "result" && <span>{reactionMs} ms — tap again</span>}
      </button>
      <p className="activity-subtitle">
        {phase === "result" && reactionMs < 250 ? "Lightning fast! ⚡" : phase === "result" && reactionMs < 400 ? "Solid reflexes!" : "Don't tap until the box turns green."}
      </p>
      <button type="button" className="activity-btn-outline" onClick={onDone}>{exitLabel}</button>
    </div>
  );
};

const Hangman = ({ onDone, exitLabel = "Back to games" }) => {
  const [word, setWord] = useState(() => HANGMAN_WORDS[Math.floor(Math.random() * HANGMAN_WORDS.length)]);
  const [guessed, setGuessed] = useState([]);
  const [wrong, setWrong] = useState(0);
  const MAX_WRONG = 6;

  const guess = (letter) => {
    if (guessed.includes(letter) || won || lost) return;
    setGuessed(g => [...g, letter]);
    if (!word.includes(letter)) setWrong(w => w + 1);
  };

  const won = word.split("").every(l => guessed.includes(l));
  const lost = wrong >= MAX_WRONG;
  const display = word.split("").map(l => (guessed.includes(l) ? l : "_")).join(" ");
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const newRound = () => {
    let next = HANGMAN_WORDS[Math.floor(Math.random() * HANGMAN_WORDS.length)];
    while (next === word && HANGMAN_WORDS.length > 1) {
      next = HANGMAN_WORDS[Math.floor(Math.random() * HANGMAN_WORDS.length)];
    }
    setWord(next);
    setGuessed([]);
    setWrong(0);
  };

  return (
    <div className="activity-center game-activity game-activity--standalone">
      <div className="hangman-stage">{HANGMAN_STAGES[wrong] || "😊"}</div>
      <p className="hangman-word">{display}</p>
      <p className="hangman-lives">Wrong guesses: {wrong} / {MAX_WRONG}</p>
      {won && <p className="game-banner-msg game-banner-msg--win">You got it — {word}! 🎉</p>}
      {lost && <p className="game-banner-msg game-banner-msg--lose">The word was {word}</p>}
      <div className="hangman-keyboard">
        {letters.map(letter => {
          const picked = guessed.includes(letter);
          const correct = picked && word.includes(letter);
          const miss = picked && !word.includes(letter);
          return (
            <button
              key={letter}
              type="button"
              className={`hangman-key ${correct ? "hangman-key--ok" : ""} ${miss ? "hangman-key--bad" : ""}`}
              onClick={() => guess(letter)}
              disabled={picked || won || lost}
            >
              {letter}
            </button>
          );
        })}
      </div>
      {(won || lost) && (
        <div className="game-actions">
          <button type="button" className="activity-btn-outline" onClick={newRound}>New word</button>
        </div>
      )}
      <button type="button" className="activity-btn-outline" onClick={onDone}>{exitLabel}</button>
    </div>
  );
};

const DiceBattle = ({ onDone, exitLabel = "Back to games" }) => {
  const [player, setPlayer] = useState(null);
  const [cpu, setCpu] = useState(null);
  const [rolling, setRolling] = useState(false);
  const [stats, setStats] = useState({ wins: 0, losses: 0, draws: 0 });
  const [lastResult, setLastResult] = useState(null);

  const roll = () => {
    if (rolling) return;
    setRolling(true);
    setLastResult(null);
    let ticks = 0;
    const interval = setInterval(() => {
      setPlayer(Math.ceil(Math.random() * 6));
      setCpu(Math.ceil(Math.random() * 6));
      ticks += 1;
      if (ticks >= 10) {
        clearInterval(interval);
        const p = Math.ceil(Math.random() * 6);
        const c = Math.ceil(Math.random() * 6);
        setPlayer(p);
        setCpu(c);
        setRolling(false);
        let outcome = "draw";
        if (p > c) outcome = "win";
        else if (p < c) outcome = "lose";
        setLastResult(outcome);
        setStats(s => ({
          wins: s.wins + (outcome === "win" ? 1 : 0),
          losses: s.losses + (outcome === "lose" ? 1 : 0),
          draws: s.draws + (outcome === "draw" ? 1 : 0),
        }));
      }
    }, 70);
  };

  const diceFace = (n) => ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"][n - 1] || "🎲";

  return (
    <div className="activity-center game-activity game-activity--standalone">
      <div className="rps-scoreboard">
        <span>Wins <strong>{stats.wins}</strong></span>
        <span>Draws <strong>{stats.draws}</strong></span>
        <span>Losses <strong>{stats.losses}</strong></span>
      </div>
      <div className="dice-arena">
        <div className="dice-box">
          <span className="dice-label">You</span>
          <span className={`dice-face ${rolling ? "dice-face--roll" : ""}`}>{player ? diceFace(player) : "🎲"}</span>
        </div>
        <span className="rps-vs">VS</span>
        <div className="dice-box">
          <span className="dice-label">CPU</span>
          <span className={`dice-face ${rolling ? "dice-face--roll" : ""}`}>{cpu ? diceFace(cpu) : "🎲"}</span>
        </div>
      </div>
      {lastResult && !rolling && (
        <p className={`rps-result rps-result--${lastResult === "win" ? "player" : lastResult === "lose" ? "cpu" : "draw"}`}>
          {lastResult === "win" ? "You rolled higher! 🎉" : lastResult === "lose" ? "CPU rolled higher" : "Same roll — draw!"}
        </p>
      )}
      <div className="game-actions">
        <button type="button" className="activity-btn" onClick={roll} disabled={rolling}>{rolling ? "Rolling..." : "Roll dice"}</button>
        <button type="button" className="activity-btn-outline" onClick={onDone}>{exitLabel}</button>
      </div>
    </div>
  );
};

const MemoryMatch = ({ onDone, standalone = false, exitLabel = "Continue ✓" }) => {
  const shuffle = () => {
    const pairs = [...MEMORY_EMOJIS, ...MEMORY_EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }));
    return pairs;
  };
  const [cards, setCards] = useState(shuffle);
  const [selected, setSelected] = useState([]);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);

  const matchedCount = cards.filter(c => c.matched).length;
  const allMatched = matchedCount === cards.length;

  const handleFlip = (id) => {
    if (locked) return;
    const card = cards.find(c => c.id === id);
    if (card.flipped || card.matched) return;
    const newCards = cards.map(c => c.id === id ? { ...c, flipped: true } : c);
    setCards(newCards);
    const newSelected = [...selected, id];
    setSelected(newSelected);
    if (newSelected.length === 2) {
      setMoves(m => m + 1);
      setLocked(true);
      const [a, b] = newSelected.map(sid => newCards.find(c => c.id === sid));
      setTimeout(() => {
        setCards(prev => prev.map(c =>
          newSelected.includes(c.id)
            ? { ...c, matched: a.emoji === b.emoji, flipped: a.emoji === b.emoji }
            : c
        ));
        setSelected([]);
        setLocked(false);
      }, 900);
    }
  };

  return (
    <div className={`activity-center game-activity ${standalone ? "game-activity--standalone" : ""}`}>
      {!standalone && <p className="activity-subtitle">Flip cards to find matching pairs! 🃏</p>}
      <div className="memory-stats">
        <span>Matches: <strong style={{ color: "#4caf7d" }}>{matchedCount / 2}/{MEMORY_EMOJIS.length}</strong></span>
        <span>Moves: <strong>{moves}</strong></span>
      </div>
      <div className={`memory-grid ${standalone ? "memory-grid--play" : ""}`}>
        {cards.map(card => (
          <div
            key={card.id}
            className={`memory-card ${card.flipped || card.matched ? "flipped" : ""} ${card.matched ? "matched" : ""}`}
            onClick={() => handleFlip(card.id)}
          >
            <div className="memory-card-inner">
              <div className="memory-card-front">?</div>
              <div className="memory-card-back">{card.emoji}</div>
            </div>
          </div>
        ))}
      </div>
      {allMatched && (
        <div className="game-win-banner">
          <p>🎉 All matched in {moves} moves!</p>
          <div className="game-actions">
            <button type="button" className="activity-btn-outline" onClick={() => { setCards(shuffle()); setMoves(0); setSelected([]); }}>Play again</button>
            <button type="button" className="activity-btn" onClick={onDone}>{exitLabel}</button>
          </div>
        </div>
      )}
      {!allMatched && standalone && (
        <button type="button" className="activity-btn-outline game-exit-only" onClick={onDone}>{exitLabel}</button>
      )}
    </div>
  );
};

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────
const MoodTracker = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isGuest } = useAuth();

  const [stage, setStage] = useState("welcome");
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [moodLevel, setMoodLevel] = useState(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [quickGameId, setQuickGameId] = useState(null);
  const [gameQuery, setGameQuery] = useState("");
  const [gameCategory, setGameCategory] = useState("All");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState([]);

  // Deep-link from chat suggestion chips: ?activity=breathing etc.
  useEffect(() => {
    const activity = searchParams.get("activity");
    if (activity) {
      setQuickGameId(activity);
      setStage("quickplay");
    }
  }, [searchParams]);

  const handleAnswer = (s) => {
    const newScore = score + s;
    const currentQuestion = QUESTIONS[qIdx];
    const selectedOption = currentQuestion.options.find(opt => opt.score === s);
    
    // Store the actual answer
    const newAnswer = {
      question: currentQuestion.q,
      answer: selectedOption ? selectedOption.text : 'Not answered',
      score: s
    };
    
    setQuizAnswers([...quizAnswers, newAnswer]);
    
    if (qIdx < QUESTIONS.length - 1) {
      setScore(newScore);
      setQIdx(qIdx + 1);
    } else {
      const level = getMoodLevel(newScore);
      setMoodLevel(level);
      setStage("result");
      setScore(newScore);
    }
  };

  const startPlan = () => { setStepIdx(0); setStage("plan"); };
  const nextStep = () => {
    const plan = PLANS[moodLevel];
    if (stepIdx < plan.length - 1) setStepIdx(stepIdx + 1);
    else setStage("complete");
  };

  const restart = () => { 
    setStage("welcome"); 
    setQIdx(0); 
    setScore(0); 
    setMoodLevel(null); 
    setStepIdx(0); 
    setQuickGameId(null);
    setGameQuery("");
    setGameCategory("All");
    setSaveError(null);
    setSaveSuccess(false);
    setQuizAnswers([]);
  };

  const openQuickGame = (gameId) => {
    setQuickGameId(gameId);
    setStage("quickplay");
  };

  const exitQuickGame = () => {
    setQuickGameId(null);
    setStage("games");
  };

  const allGameCategories = useMemo(() => {
    const tags = new Set();
    QUICK_GAMES.forEach(g => (g.tags || []).forEach(t => tags.add(t)));
    return ["All", ...Array.from(tags).sort()];
  }, []);

  const filteredGames = useMemo(() => {
    const q = gameQuery.trim().toLowerCase();
    return QUICK_GAMES.filter(g => {
      const inCategory = gameCategory === "All" ? true : (g.tags || []).includes(gameCategory);
      if (!inCategory) return false;
      if (!q) return true;
      const hay = `${g.title} ${g.desc} ${(g.tags || []).join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }, [gameQuery, gameCategory]);

  const featuredGame = filteredGames[0] || QUICK_GAMES[0];

  const renderQuickGame = (gameId, onExit) => {
    const exitLabel = "← Back to hub";
    const props = { onDone: onExit, standalone: true, exitLabel };
    switch (gameId) {
      // Wellness
      case "breathing": return <BreathingExercise onDone={onExit} exitLabel={exitLabel} />;
      case "affirmation": return <AffirmationCard onDone={onExit} exitLabel={exitLabel} />;
      case "gratitude": return <GratitudePrompt onDone={onExit} exitLabel={exitLabel} />;
      case "reframe": return <ReframeActivity onDone={onExit} />;
      case "quote": return <QuoteCard onDone={onExit} />;
      // Games
      case "tictactoe": return <TicTacToe {...props} />;
      case "memorymatch": return <MemoryMatch {...props} />;
      case "wordscramble": return <WordScramble onDone={onExit} exitLabel={exitLabel} />;
      case "rps": return <RockPaperScissors onDone={onExit} exitLabel={exitLabel} />;
      case "colormatch": return <ColorMatch onDone={onExit} exitLabel={exitLabel} />;
      case "simon": return <SimonSays onDone={onExit} exitLabel={exitLabel} />;
      case "bubblepop": return <BubblePop onDone={onExit} exitLabel={exitLabel} />;
      case "reaction": return <ReactionTap onDone={onExit} exitLabel={exitLabel} />;
      case "hangman": return <Hangman onDone={onExit} exitLabel={exitLabel} />;
      case "dice": return <DiceBattle onDone={onExit} exitLabel={exitLabel} />;
      default: return null;
    }
  };

  const saveMoodEntry = async () => {
    if (!moodLevel || isSaving) return;
    
    // Check if user is in guest mode
    if (isGuest) {
      setSaveError('Please login to save mood entries');
      return;
    }
    
    setIsSaving(true);
    setSaveError(null);
    
    try {
      // Convert score to intensity (1-10), ensuring it stays within bounds
      const rawIntensity = (score / 20) * 10;
      const intensity = Math.max(1, Math.min(10, Math.round(rawIntensity)));
      
      console.log('=== DEBUG: MoodTracker Save ===');
      console.log('Score:', score);
      console.log('Raw intensity calculation:', `(score / 20) * 10 = (${score} / 20) * 10 = ${rawIntensity}`);
      console.log('Rounded intensity:', intensity);
      console.log('MoodLevel:', moodLevel);
      console.log('Intensity validation check:', intensity >= 1 && intensity <= 10 ? 'PASS' : 'FAIL');
      
      // Get the plan - ensure it's available
      const currentPlan = PLANS[moodLevel] || [];
      console.log('Plan length:', currentPlan.length);
      
      // Create detailed exercise data
      const detailedData = {
        quizAnswers: quizAnswers || [],
        activitiesPlan: currentPlan,
        scoreBreakdown: {
          totalScore: score,
          maxScore: 20,
          questionCount: QUESTIONS.length
        }
      };

      const moodData = {
        mood: moodLevel,
        intensity,
        notes: `Completed ${currentPlan.length}-step mood exercise. Score: ${score}/20`,
        exerciseDetails: JSON.stringify(detailedData)
      };
      
      console.log('Final mood data:', moodData);
      
      await moodService.createMoodEntry(moodData);
      setSaveSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving mood entry:', error);
      setSaveError(error.message || 'Failed to save mood entry');
    } finally {
      setIsSaving(false);
    }
  };

  const meta = moodLevel ? MOOD_META[moodLevel] : null;
  const plan = moodLevel ? PLANS[moodLevel] : [];
  const step = plan[stepIdx];

  const renderActivity = () => {
    const onDone = nextStep;
    switch (step.type) {
      case "breathing": return <BreathingExercise onDone={onDone} />;
      case "affirmation": return <AffirmationCard onDone={onDone} />;
      case "gratitude": return <GratitudePrompt onDone={onDone} />;
      case "tictactoe": return <TicTacToe onDone={onDone} />;
      case "quote": return <QuoteCard onDone={onDone} />;
      case "wordscramble": return <WordScramble onDone={onDone} />;
      case "journal": return <JournalActivity moodLevel={moodLevel} onDone={onDone} />;
      case "reframe": return <ReframeActivity onDone={onDone} />;
      case "memorymatch": return <MemoryMatch onDone={onDone} />;
      default: return null;
    }
  };

  // WELCOME STAGE
  if (stage === "welcome") {
    return (
      <div className="mood-page">
        <div className="welcome-dashboard">

          {/* Hero */}
          <div className="welcome-hero">
            <span className="welcome-hero-emoji">🌿</span>
            <h1>How are you feeling?</h1>
            <p>Take a moment to check in with yourself</p>
          </div>

          {/* Main Actions (Grid) */}
          <div className="custom-cards-grid">
            <button className="custom-card card-green" onClick={() => setStage("quiz")}>
              <div className="card-badge">🎯</div>
              <div className="card-content">
                <div className="card-title">Daily</div>
                <div className="card-subtitle">Check-In</div>
              </div>
            </button>

            <button className="custom-card card-pink" onClick={() => navigate('/chat/mood-history')}>
              <div className="card-badge">📊</div>
              <div className="card-content">
                <div className="card-title">View</div>
                <div className="card-subtitle">History</div>
              </div>
            </button>

            <button className="custom-card card-white-green" onClick={() => navigate('/chat')}>
              <div className="card-badge">💬</div>
              <div className="card-content">
                <div className="card-title">Chat with</div>
                <div className="card-subtitle">Companion</div>
              </div>
            </button>

            <button className="custom-card card-white-pink" onClick={() => setStage("games")}>
              <div className="card-badge">🌿</div>
              <div className="card-content">
                <div className="card-title">Wellness</div>
                <div className="card-subtitle">Hub</div>
              </div>
            </button>
          </div>

        </div>
      </div>
    );
  }

  // ── GAMES MENU ──
  if (stage === "games") {
    return (
      <div className="mood-page">
        <div className="quickplay-hub">
          <div className="quickplay-hub-topbar">
            <button type="button" className="back-btn" onClick={() => setStage("welcome")}>← Back</button>
            <div className="quickplay-hub-title">
              <span className="hub-title-emoji">🌿</span>
              <div>
                <h1>Wellness Hub</h1>
                <p>Breathe, reflect, play — your space to reset</p>
              </div>
            </div>
          </div>

          <div className="quickplay-controls">
            <div className="quickplay-search">
              <span className="qp-search-icon">⌕</span>
              <input
                value={gameQuery}
                onChange={(e) => setGameQuery(e.target.value)}
                className="qp-search-input"
                placeholder="Search activities..."
                type="text"
              />
              {gameQuery && (
                <button type="button" className="qp-search-clear" onClick={() => setGameQuery("")}>×</button>
              )}
            </div>
            <div className="quickplay-chips" role="tablist" aria-label="Game categories">
              {allGameCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`qp-chip ${gameCategory === cat ? "active" : ""}`}
                  onClick={() => setGameCategory(cat)}
                  role="tab"
                  aria-selected={gameCategory === cat}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="featured-game" style={{ "--game-accent": featuredGame.color }}>
            <div className="featured-bg" />
            <div className="featured-content">
              <div className="featured-badge">Featured</div>
              <div className="featured-main">
                <span className="featured-emoji">{featuredGame.emoji}</span>
                <div className="featured-text">
                  <h2>{featuredGame.title}</h2>
                  <p>{featuredGame.desc}</p>
                  <div className="featured-tags">
                    {(featuredGame.tags || []).map(t => <span key={t} className="featured-tag">{t}</span>)}
                  </div>
                </div>
              </div>
              <div className="featured-actions">
                <button type="button" className="featured-play" onClick={() => openQuickGame(featuredGame.id)}>
                  Play now →
                </button>
              </div>
            </div>
          </div>

          <div className="hub-grid-header">
            <h3>All activities</h3>
            <span className="hub-grid-count">{filteredGames.length} available</span>
          </div>

          <div className="hub-grid">
            {filteredGames.length === 0 ? (
              <div className="hub-empty">
                <p>No activities found.</p>
                <button type="button" className="activity-btn-outline" onClick={() => { setGameQuery(""); setGameCategory("All"); }}>Reset filters</button>
              </div>
            ) : (
              filteredGames.map((game) => (
                <button
                  key={game.id}
                  type="button"
                  className="hub-card"
                  style={{ "--game-accent": game.color }}
                  onClick={() => openQuickGame(game.id)}
                >
                  <span className="hub-card-glow" />
                  <div className="hub-card-top">
                    <span className="hub-card-emoji">{game.emoji}</span>
                    <span className="hub-card-title">{game.title}</span>
                  </div>
                  <p className="hub-card-desc">{game.desc}</p>
                  <div className="hub-card-tags">
                    {(game.tags || []).slice(0, 2).map(t => <span key={t} className="hub-card-tag">{t}</span>)}
                    <span className="hub-card-cta">Play →</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── STANDALONE QUICK PLAY (no step counter) ──
  if (stage === "quickplay" && quickGameId) {
    const gameMeta = QUICK_GAMES.find((g) => g.id === quickGameId);
    return (
      <div className="mood-page">
        <div className="quickplay-wrap">
          <button type="button" className="back-btn" onClick={exitQuickGame}>← Back</button>
          <div className="quickplay-header" style={{ "--game-accent": gameMeta?.color || "#2a9d8f" }}>
            <span className="quickplay-icon">{gameMeta?.emoji}</span>
            <div>
              <h2>{gameMeta?.title}</h2>
              <p>{gameMeta?.desc}</p>
            </div>
          </div>
          <div className="quickplay-card">
            {renderQuickGame(quickGameId, exitQuickGame)}
          </div>
        </div>
      </div>
    );
  }

  // ── QUIZ ──
  if (stage === "quiz") {
    const q = QUESTIONS[qIdx];
    return (
      <div className="mood-page">
        <div className="mood-quiz-wrap">
          <button className="back-btn" onClick={restart}>← Back</button>
          <div className="quiz-progress-bar">
            <div className="quiz-progress-fill" style={{ width: `${((qIdx) / QUESTIONS.length) * 100}%` }} />
          </div>
          <p className="quiz-step-label">Question {qIdx + 1} of {QUESTIONS.length}</p>
          <h2 className="quiz-q">{q.q}</h2>
          <div className="quiz-opts">
            {q.options.map((o, i) => (
              <button key={i} className="quiz-opt" onClick={() => handleAnswer(o.score)}>
                {o.text}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── RESULT ──
  if (stage === "result") {
    return (
      <div className="mood-page">
        <button className="back-btn" onClick={restart}>← Back</button>
        <div className="result-card" style={{ borderColor: meta.color, background: meta.bg }}>
          <div className="result-emoji">{meta.label.split(" ").pop()}</div>
          <h2 className="result-label" style={{ color: meta.color }}>{meta.label}</h2>
          <p className="result-desc">{meta.desc}</p>
          <div className="plan-preview">
            <p className="plan-preview-title">Your personalized 5-step plan:</p>
            <div className="plan-steps-preview">
              {PLANS[moodLevel].map((s, i) => (
                <div key={i} className="plan-step-chip">
                  <span>{s.icon}</span> {s.title}
                </div>
              ))}
            </div>
          </div>
          <button className="start-plan-btn" style={{ background: meta.color }} onClick={startPlan}>
            Start My Plan →
          </button>
          <button className="retake-btn" onClick={restart}>Retake Quiz</button>
        </div>
      </div>
    );
  }

  // ── PLAN STEPS ──
  if (stage === "plan") {
    return (
      <div className="mood-page">
        <div className="plan-page-wrap">
          <button className="back-btn" onClick={restart}>← Back</button>
          {/* Step breadcrumb */}
          <div className="step-breadcrumb">
            {plan.map((s, i) => (
              <div key={i} className={`step-dot ${i < stepIdx ? "done" : i === stepIdx ? "active" : ""}`} style={{ background: i <= stepIdx ? meta.color : undefined }} />
            ))}
          </div>
          <p className="step-counter" style={{ color: meta.color }}>Step {stepIdx + 1} of {plan.length}</p>

          <div className="step-card">
            <div className="step-header">
              <span className="step-icon">{step.icon}</span>
              <div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-desc-sm">{step.desc}</p>
              </div>
            </div>
            <div className="step-content">
              {renderActivity()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── COMPLETE ──
  return (
    <div className="mood-page">
      <div className="complete-card">
        <div className="complete-emoji">🌟</div>
        <h2>Session Complete!</h2>
        <p>You showed up for yourself today. That matters more than you know.</p>
        <div className="complete-summary">
          <p>Mood: <strong style={{ color: meta.color }}>{meta.label}</strong></p>
          <p>Steps completed: <strong>{plan.length}</strong></p>
        </div>
        
        {/* Save Status Messages */}
        {saveSuccess && (
          <div style={{ 
            padding: "0.75rem", 
            backgroundColor: "rgba(76, 175, 125, 0.1)", 
            border: "1px solid #4caf7d", 
            borderRadius: "8px", 
            marginTop: "1rem",
            textAlign: "center"
          }}>
            <p style={{ color: "#4caf7d", margin: 0 }}>Mood saved successfully! </p>
          </div>
        )}
        
        {saveError && (
          <div style={{ 
            padding: "0.75rem", 
            backgroundColor: "rgba(224, 122, 95, 0.1)", 
            border: "1px solid #e07a5f", 
            borderRadius: "8px", 
            marginTop: "1rem",
            textAlign: "center"
          }}>
            <p style={{ color: "#e07a5f", margin: 0 }}>Error: {saveError}</p>
          </div>
        )}
        
        {/* Action Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1.5rem" }}>
          {isGuest ? (
            <div style={{ textAlign: "center", padding: "1rem", backgroundColor: "rgba(255, 193, 7, 0.1)", borderRadius: "8px", border: "1px solid rgba(255, 193, 7, 0.3)" }}>
              <p style={{ margin: "0 0 1rem 0", color: "#856404" }}>
                Want to save your mood entries and track your progress over time?
              </p>
              <button 
                className="start-plan-btn" 
                onClick={() => navigate('/chat/profile')}
                style={{ background: "#ffc107", color: "#000" }}
              >
                Login or Sign Up 
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", gap: "1rem" }}>
                <button 
                  className="start-plan-btn" 
                  style={{ 
                    background: meta.color,
                    opacity: isSaving ? 0.7 : 1,
                    cursor: isSaving ? "not-allowed" : "pointer"
                  }} 
                  onClick={saveMoodEntry}
                  disabled={isSaving || saveSuccess}
                >
                  {isSaving ? "Saving..." : saveSuccess ? "Saved " : "Save Mood Entry"}
                </button>
                <button 
                  className="retake-btn" 
                  onClick={restart}
                  style={{ flex: 1 }}
                >
                  Check In Again
                </button>
              </div>
              
              <button 
                className="activity-btn-outline" 
                onClick={() => navigate('/chat/mood-history')}
                style={{ width: "100%" }}
              >
                View Mood History 
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MoodTracker;
