// 'react'와 'react-dom' import를 제거합니다.
// import React, { useState, useEffect, useCallback } from 'react';
// import ReactDOM from 'react-dom/client';

// index.html에서 로드한 전역 React 객체에서 훅(Hook)을 가져옵니다.
const { useState, useEffect, useCallback } = React;

// 분리된 data.js 파일에서 CARD_DATA와 TRANSLATIONS를 가져옵니다.
// 경로를 index.html 기준인 './src/data.js'로 수정합니다.
import { CARD_DATA, TRANSLATIONS } from './src/data.js';

// --- 헬퍼 함수: 배열 섞기 (Fisher-Yates Shuffle) ---
function shuffleArray(array) {
  let currentIndex = array.length,  randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
}

// --- 카드 뒷면 컴포넌트 ---
const CardBack = () => (
  <div className="w-full h-full bg-gradient-to-b from-indigo-500 to-purple-700 rounded-lg border-4 border-yellow-300 flex items-center justify-center p-4">
    <svg className="w-1/2 h-1/2 text-yellow-300 opacity-50" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 15.586l-2.939 2.034.56-3.4-2.47-2.4 3.4-.5L10 8.186l1.549 3.134 3.4 .5-2.47 2.4 .56 3.4L10 15.586zM10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"></path>
    </svg>
  </div>
);

// --- 카드 앞면 컴포넌트 ---
const CardFront = ({ name, isReversed, imageUrl }) => (
  <div className="w-full h-full bg-white rounded-lg border-4 border-yellow-500 flex flex-col items-center justify-center p-4 text-center text-gray-800 overflow-hidden">
    <div className={`w-full h-full flex flex-col items-center justify-center transition-transform duration-500 ${isReversed ? 'rotate-180' : ''}`}>
      <div className="w-full h-full mb-2 flex items-center justify-center overflow-hidden">
        <img 
          src={imageUrl} 
          alt={name} 
          className="w-full h-full object-contain"
          onError={(e) => { e.target.src = 'https://placehold.co/200x350/FF0000/FFFFFF?text=Error'; }}
        />
      </div>
    </div>
  </div>
);

// --- 언어 선택 컴포넌트 ---
const LanguageSelector = ({ lang, setLang }) => {
  const languages = [
    { code: 'ko', flag: '🇰🇷', name: '한' },
    { code: 'ja', flag: '🇯🇵', name: '日' },
    { code: 'zh', flag: '🇨🇳', name: '中' },
  ];

  return (
    <div className="absolute top-4 right-4 bg-gray-800 bg-opacity-70 rounded-lg p-2 flex space-x-2 z-10">
      {languages.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          className={`px-3 py-2 rounded-md text-xl transition-all duration-300 ${
            lang === l.code
              ? 'bg-yellow-400 text-gray-900 scale-110 shadow-lg'
              : 'bg-gray-700 text-white hover:bg-gray-600'
          }`}
          title={l.name}
        >
          {l.flag}
        </button>
      ))}
    </div>
  );
};


// --- 메인 앱 컴포넌트 ---
function App() {
  const [lang, setLang] = useState('ko'); // 언어 상태
  const [cards, setCards] = useState([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [currentMeaning, setCurrentMeaning] = useState("");
  const [isShuffling, setIsShuffling] = useState(false);

  // 현재 언어에 맞는 번역본을 가져옵니다.
  const t = TRANSLATIONS[lang];

  // 게임 초기화 (카드 섞고 3장 뽑기)
  const initializeGame = useCallback(() => {
    setIsShuffling(true);
    setCurrentMeaning(t.result_placeholder); // 언어에 맞게 플레이스홀더 설정

    setTimeout(() => {
      // 현재 언어의 덱 데이터를 가져옵니다.
      const currentDeckData = TRANSLATIONS[lang].deck;
      
      // 고정 데이터(이미지)와 번역된 데이터(이름, 의미)를 합칩니다.
      const fullDeck = CARD_DATA.map(card => ({ 
        ...card, 
        ...currentDeckData[card.key] 
      }));

      const shuffled = shuffleArray(fullDeck);
      
      const drawnCards = shuffled.slice(0, 3).map(card => ({ 
        ...card, 
        flipped: false,
        isReversed: Math.random() < 0.5
      }));
      
      setCards(drawnCards);
      setRevealedCount(0);
      setIsShuffling(false);
    }, 500);
  }, [lang, t]); // lang 또는 t가 변경되면 이 함수도 새로 생성됩니다.

  // 컴포넌트 마운트 시 및 언어가 변경될 때마다 게임을 초기화합니다.
  useEffect(() => {
    initializeGame();
  }, [initializeGame]); // initializeGame 함수 자체가 의존성입니다.

  // 카드 클릭 핸들러
  const handleCardClick = (index) => {
    if (index !== revealedCount || (cards[index] && cards[index].flipped)) {
      return;
    }

    // cards 배열이 아직 준비되지 않았으면(초기화 중) 클릭을 무시합니다.
    if (!cards[index]) return;

    const newCards = [...cards];
    newCards[index].flipped = true;
    setCards(newCards);

    setRevealedCount(index + 1);

    const clickedCard = newCards[index];
    const isReversed = clickedCard.isReversed;
    // 번역된 텍스트를 사용합니다.
    const position = isReversed ? t.position.reversed : t.position.upright;
    let meaningKey = "";
    let positionLabel = "";

    if (index === 0) {
      positionLabel = t.position.past;
      meaningKey = isReversed ? "pastReversed" : "past";
    } else if (index === 1) {
      positionLabel = t.position.present;
      meaningKey = isReversed ? "presentReversed" : "present";
    } else if (index === 2) {
      positionLabel = t.position.future;
      meaningKey = isReversed ? "futureReversed" : "future";
    }

    // 번역된 레이블을 사용하여 의미를 설정합니다.
    const meaningText = `${positionLabel} ${position}\n${t.card_label} ${clickedCard.name}\n${t.meaning_label} ${clickedCard.meanings[meaningKey]}`;
    setCurrentMeaning(meaningText);
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6 font-sans">
      
      {/* 언어 선택기 */}
      <LanguageSelector lang={lang} setLang={setLang} />

      {/* 상단 안내 문구 (번역 적용) */}
      <div className="text-center mb-8 mt-16 md:mt-0">
        <h1 className="text-3xl font-bold text-yellow-300 mb-2">{t.title}</h1>
        <p className="text-lg text-gray-300 whitespace-pre-line">
          {t.description}
        </p>
      </div>

      {/* 중단 카드 배열 */}
      <div className="flex justify-center space-x-4 md:space-x-8 mb-8 perspective-1000">
        {cards.map((card, index) => (
          <div
            key={index}
            className={`w-28 h-48 md:w-40 md:h-64 cursor-pointer transition-transform duration-700 transform-style-3d ${
              card && card.flipped ? 'rotate-y-180' : ''
            } ${
              isShuffling ? 'animate-pulse' : ''
            }`}
            onClick={() => handleCardClick(index)}
          >
            <div className="absolute w-full h-full backface-hidden">
              <CardBack />
            </div>
            <div className="absolute w-full h-full backface-hidden rotate-y-180">
              {card && <CardFront name={card.name} isReversed={card.isReversed} imageUrl={card.imageUrl} />}
            </div>
          </div>
        ))}
      </div>

      {/* 하단 의미 출력 (번역 적용) */}
      <div className="w-full max-w-2xl bg-gray-800 rounded-lg shadow-xl p-6 min-h-[150px] text-center">
        <h2 className="text-xl font-semibold mb-3 text-yellow-300">{t.meaning_header}</h2>
        <p className="text-gray-200 whitespace-pre-line">{currentMeaning}</p>
      </div>

      {/* 다시 뽑기 버튼 (번역 적용) */}
      <button
        onClick={initializeGame}
        disabled={isShuffling}
        className="mt-8 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-lg transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isShuffling ? t.shuffling_button : t.reset_button}
      </button>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        /* 반응형 디자인: 작은 화면에서 언어 선택기 가려짐 방지 */
        @media (max-width: 640px) {
          .text-center.mb-8 {
            margin-top: 4.5rem; /* 72px */
          }
        }
      `}</style>
    </div>
  );
}

// React 앱을 DOM에 렌더링합니다.
const container = document.getElementById('root');
// 전역 ReactDOM 객체를 사용합니다.
const root = ReactDOM.createRoot(container);
root.render(
  // React.StrictMode를 사용합니다.
  <React.StrictMode>
    <App />
  </React.StrictMode>
);