import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, Timer, CheckCircle2, XCircle, Loader2, ArrowLeft, Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../utils/api';

// سوالات دموی کویز
const quizQuestions = [
  {
    question: 'پایتخت ژاپن کدام شهر است؟',
    options: ['پکن', 'سئول', 'توکیو', 'بانکوک'],
    answer: 2,
  },
  {
    question: 'بزرگ‌ترین سیاره منظومه شمسی کدام است؟',
    options: ['زحل', 'مشتری', 'اورانوس', 'نپتون'],
    answer: 1,
  },
  {
    question: 'زبان برنامه‌نویسی React با کدام زبان نوشته شده؟',
    options: ['Python', 'Java', 'JavaScript', 'C++'],
    answer: 2,
  },
  {
    question: 'کدام حیوان سریع‌ترین حیوان خشکی است؟',
    options: ['شیر', 'یوزپلنگ', 'اسب', 'خرگوش'],
    answer: 1,
  },
  {
    question: 'سال نوری واحد اندازه‌گیری چیست؟',
    options: ['زمان', 'فاصله', 'سرعت', 'جرم'],
    answer: 1,
  },
];

export default function PlayGame() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { isRtl } = useLanguage();

  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(15);

  const question = quizQuestions[currentQ];
  const totalQuestions = quizQuestions.length;

  // تایمر
  useEffect(() => {
    if (gameOver || showResult) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleAnswer(-1); // وقت تموم شد
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQ, gameOver, showResult]);

  // انتخاب جواب
  const handleAnswer = (index) => {
    if (showResult) return;
    setSelected(index);
    setShowResult(true);

    if (index === question.answer) {
      setScore((s) => s + 1);
    }

    // بعد از ۱.۵ ثانیه سوال بعدی
    setTimeout(() => {
      if (currentQ + 1 < totalQuestions) {
        setCurrentQ((q) => q + 1);
        setSelected(null);
        setShowResult(false);
        setTimeLeft(15);
      } else {
        setGameOver(true);
      }
    }, 1500);
  };

  // دریافت پاداش — صدا زدن endpoint شروع تسک و تکمیل
  const handleClaimReward = async () => {
    setClaiming(true);
    setError('');
    try {
      // درخواست تکمیل تسک از طریق بک‌اند داخلی
      await api.post(`/api/tasks/${taskId}/complete`);
      setClaimed(true);
    } catch (err) {
      setError(err.response?.data?.message || 'خطا در دریافت پاداش');
    } finally {
      setClaiming(false);
    }
  };

  // صفحه نتیجه نهایی
  if (gameOver) {
    const percentage = Math.round((score / totalQuestions) * 100);
    const passed = percentage >= 60;

    return (
      <div className="flex-1 flex items-center justify-center p-6" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="w-full max-w-md text-center">
          {/* آیکون نتیجه */}
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-3xl mb-6 ${
            passed 
              ? 'bg-gradient-to-br from-green-600/20 to-emerald-600/20' 
              : 'bg-gradient-to-br from-red-600/20 to-orange-600/20'
          }`}>
            {passed ? (
              <Trophy className="w-12 h-12 text-green-400" />
            ) : (
              <XCircle className="w-12 h-12 text-red-400" />
            )}
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">
            {passed ? '🎉 آفرین! قبول شدی!' : 'متأسفانه قبول نشدی'}
          </h2>

          <p className="text-gray-400 mb-6">
            {score} از {totalQuestions} سوال درست — {percentage}٪
          </p>

          {/* نوار پیشرفت */}
          <div className="w-full bg-gray-800/60 rounded-full h-3 mb-8">
            <div
              className={`h-3 rounded-full transition-all duration-1000 ${
                passed ? 'bg-gradient-to-l from-green-500 to-emerald-500' : 'bg-gradient-to-l from-red-500 to-orange-500'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          {/* دکمه‌ها */}
          {passed && !claimed && (
            <>
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-4 text-red-400 text-sm">
                  {error}
                </div>
              )}
              <button
                onClick={handleClaimReward}
                disabled={claiming}
                className="w-full bg-gradient-to-l from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:opacity-50 text-white font-medium py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 mb-4"
              >
                {claiming ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    دریافت پاداش
                  </>
                )}
              </button>
            </>
          )}

          {claimed && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-5 mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-green-400 font-medium">پاداش به حسابت اضافه شد! 🎉</p>
            </div>
          )}

          {(!passed || claimed) && (
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-gray-800/60 hover:bg-gray-700/60 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              بازگشت به داشبورد
            </button>
          )}
        </div>
      </div>
    );
  }

  // صفحه بازی
  return (
    <div className="flex-1 flex items-center justify-center p-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-lg">
        {/* هدر */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-gray-400 text-sm">
            سوال {currentQ + 1} از {totalQuestions}
          </span>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-mono ${
            timeLeft <= 5 ? 'bg-red-500/10 text-red-400 border border-red-500/25' : 'bg-gray-800/50 text-gray-300 border border-gray-700/50'
          }`}>
            <Timer className="w-4 h-4" />
            {timeLeft}
          </div>
        </div>

        {/* نوار پیشرفت */}
        <div className="w-full bg-gray-800/60 rounded-full h-1.5 mb-8">
          <div
            className="h-1.5 rounded-full bg-gradient-to-l from-purple-500 to-cyan-500 transition-all duration-500"
            style={{ width: `${((currentQ) / totalQuestions) * 100}%` }}
          />
        </div>

        {/* سوال */}
        <div className="bg-gray-800/50 border border-gray-700/40 rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold text-white leading-9">{question.question}</h2>
        </div>

        {/* گزینه‌ها */}
        <div className="space-y-3">
          {question.options.map((option, index) => {
            let btnClass = 'bg-gray-800/40 border border-gray-700/40 hover:border-purple-500/40 hover:bg-gray-800/60 text-white';

            if (showResult) {
              if (index === question.answer) {
                btnClass = 'bg-green-600/20 border border-green-500/40 text-green-400';
              } else if (index === selected && index !== question.answer) {
                btnClass = 'bg-red-600/20 border border-red-500/40 text-red-400';
              } else {
                btnClass = 'bg-gray-800/20 border border-gray-700/20 text-gray-600';
              }
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={showResult}
                className={`w-full text-right px-5 py-4 rounded-xl transition-all duration-300 flex items-center justify-between ${btnClass}`}
              >
                <span className="font-medium">{option}</span>
                {showResult && index === question.answer && (
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                )}
                {showResult && index === selected && index !== question.answer && (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* امتیاز */}
        <div className="mt-6 text-center">
          <span className="text-gray-500 text-sm">
            امتیاز: <span className="text-cyan-400 font-bold">{score}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
