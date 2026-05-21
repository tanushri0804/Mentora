import React, { useState, useEffect, useRef } from "react";
import './MoodTracker.css';
import { moodService } from '../services/moodService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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

// ─── ACTIVITY COMPONENTS ──────────────────────────────────────────────────

const BreathingExercise = ({ onDone }) => {
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
        <button className="activity-btn" onClick={onDone}>Feeling better ✓</button>
      )}
    </div>
  );
};

const AffirmationCard = ({ onDone }) => {
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
          <button className="activity-btn" onClick={onDone}>I needed that ✓</button>
        </div>
      )}
    </div>
  );
};

const GratitudePrompt = ({ onDone }) => {
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
      <button className="activity-btn" disabled={filled < 1} onClick={onDone} style={{ marginTop: "1.5rem" }}>
        {filled >= 3 ? "Beautiful! Continue ✓" : filled > 0 ? `${filled}/3 — Continue anyway` : "Write at least one..."}
      </button>
    </div>
  );
};

const TicTacToe = ({ onDone }) => {
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
    <div className="activity-center">
      <p className="activity-subtitle">A quick game against the computer. You're X!</p>
      {winner
        ? <p className="ttt-status" style={{ color: winner === "X" ? "#4caf7d" : winner === "Draw" ? "#f4a261" : "#e07a5f" }}>
          {winner === "Draw" ? "It's a Draw! 🤝" : winner === "X" ? "You won! 🎉" : "CPU wins! 🤖"}
        </p>
        : <p className="ttt-status">{isX ? "Your turn ✦" : "CPU thinking..."}</p>
      }
      <div className="ttt-grid">
        {board.map((s, i) => (
          <button key={i} className={`ttt-sq ${s?.toLowerCase() || ""}`} onClick={() => handleClick(i)} disabled={!!s || !!winner || !isX}>
            {s}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
        <button className="activity-btn-outline" onClick={reset}>Restart</button>
        <button className="activity-btn" onClick={onDone}>Done playing ✓</button>
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

const WordScramble = ({ onDone }) => {
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
          <button className="activity-btn" onClick={onDone} style={{ marginTop: "1rem" }}>Continue ✓</button>
        </div>
      )}
    </div>
  );
};

// ─── JOURNAL ─────────────────────────────────────────────────────────────
const JournalActivity = ({ moodLevel, onDone }) => {
  const prompt = JOURNAL_PROMPTS[moodLevel] || JOURNAL_PROMPTS.okay;
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
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
        {!done ? (
          <button className="activity-btn" onClick={() => setDone(true)}>
            {text.length > 10 ? "That felt good ✓" : "Skip for now"}
          </button>
        ) : (
          <button className="activity-btn" onClick={onDone}>Continue →</button>
        )}
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
const MemoryMatch = ({ onDone }) => {
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
    <div className="activity-center">
      <p className="activity-subtitle">Flip cards to find matching pairs! 🃏</p>
      <div className="memory-stats">
        <span>Matches: <strong style={{ color: "#4caf7d" }}>{matchedCount / 2}/{MEMORY_EMOJIS.length}</strong></span>
        <span>Moves: <strong>{moves}</strong></span>
      </div>
      <div className="memory-grid">
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
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#4caf7d", fontWeight: 700, fontSize: "1.1rem" }}>
            🎉 All matched in {moves} moves!
          </p>
          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
            <button className="activity-btn-outline" onClick={() => { setCards(shuffle()); setMoves(0); setSelected([]); }}>Play Again</button>
            <button className="activity-btn" onClick={onDone}>Continue</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────
const MoodTracker = () => {
  const navigate = useNavigate();
  const { isGuest } = useAuth();

  const [stage, setStage] = useState("welcome"); // welcome | quiz | result | plan | complete
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [moodLevel, setMoodLevel] = useState(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [stepDone, setStepDone] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState([]); // Track actual answers

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

  const startPlan = () => { setStepIdx(0); setStepDone(false); setStage("plan"); };
  const nextStep = () => {
    const plan = PLANS[moodLevel];
    if (stepIdx < plan.length - 1) { setStepIdx(stepIdx + 1); setStepDone(false); }
    else setStage("complete");
  };

  const restart = () => { 
    setStage("welcome"); 
    setQIdx(0); 
    setScore(0); 
    setMoodLevel(null); 
    setStepIdx(0); 
    setStepDone(false); 
    setSaveError(null);
    setSaveSuccess(false);
    setQuizAnswers([]); // Clear tracked answers
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
    const onDone = () => setStepDone(true);
    switch (step.type) {
      case "breathing": return <BreathingExercise onDone={onDone} />;
      case "affirmation": return <AffirmationCard onDone={onDone} />;
      case "gratitude": return <GratitudePrompt onDone={onDone} />;
      case "tictactoe": return <TicTacToe onDone={onDone} />;
      case "quote": return <QuoteCard onDone={() => { onDone(); setTimeout(nextStep, 300); }} />;
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
              <div className="card-badge">🎮</div>
              <div className="card-content">
                <div className="card-title">Play</div>
                <div className="card-subtitle">Quick Games</div>
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
        <div className="welcome-dashboard">
          <button className="back-btn" onClick={() => setStage("welcome")}>← Back</button>
          <div className="welcome-hero" style={{ paddingTop: '0.5rem' }}>
            <span className="welcome-hero-emoji">🎮</span>
            <h1>Quick Games</h1>
            <p>Take a break and clear your mind</p>
          </div>
          <div className="welcome-games-grid">
            <button className="welcome-game-card" onClick={() => { setMoodLevel("good"); setStage("plan"); setStepIdx(1); setStepDone(false); }}>
              <span className="wgc-emoji">🎮</span>
              <div className="wgc-info">
                <h4>Tic Tac Toe</h4>
                <p>Classic strategy</p>
              </div>
            </button>
            <button className="welcome-game-card" onClick={() => { setMoodLevel("thriving"); setStage("plan"); setStepIdx(1); setStepDone(false); }}>
              <span className="wgc-emoji">🃏</span>
              <div className="wgc-info">
                <h4>Memory Match</h4>
                <p>Test your memory</p>
              </div>
            </button>
            <button className="welcome-game-card" onClick={() => { setMoodLevel("thriving"); setStage("plan"); setStepIdx(0); setStepDone(false); }}>
              <span className="wgc-emoji">🔤</span>
              <div className="wgc-info">
                <h4>Word Scramble</h4>
                <p>Unscramble the words</p>
              </div>
            </button>
            <button className="welcome-game-card" onClick={() => { setMoodLevel("okay"); setStage("plan"); setStepIdx(0); setStepDone(false); }}>
              <span className="wgc-emoji">🫁</span>
              <div className="wgc-info">
                <h4>Breathing</h4>
                <p>Relax & focus</p>
              </div>
            </button>
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

          {stepDone && (
            <button className="activity-btn" style={{ width: "100%", marginTop: "1.5rem", background: meta.color }} onClick={nextStep}>
              {stepIdx < plan.length - 1 ? `Next Step →` : "Finish Session 🎉"}
            </button>
          )}
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
