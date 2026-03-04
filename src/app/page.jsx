'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
    const [isOpen, setIsOpen] = useState(false);
    const [confetti, setConfetti] = useState([]);
    const [stars, setStars] = useState([]);
    const [mounted, setMounted] = useState(false);
    const [hover, setHover] = useState(false);
    const [showCake, setShowCake] = useState(false);
    const [candlesLit, setCandlesLit] = useState([true, true, true, true, true]);
    const [blowPower, setBlowPower] = useState(0);
    const [micActive, setMicActive] = useState(false);
    const [micPermission, setMicPermission] = useState(null);

    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const sourceRef = useRef(null);
    const animationFrameRef = useRef(null);

    useEffect(() => {
        setMounted(true);
        const newStars = [];
        for (let i = 0; i < 50; i++) {
            newStars.push({
                id: i,
                left: Math.random() * 100,
                top: Math.random() * 100,
                size: Math.random() * 3 + 1,
                duration: Math.random() * 3 + 2,
            });
        }
        setStars(newStars);
    }, []);

    // Эффект для показа торта после открытия подарка
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                setShowCake(true);
            }, 1500);
        } else {
            setShowCake(false);
            setCandlesLit([true, true, true, true, true]);
            setMicActive(false);
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        }
    }, [isOpen]);

    // Запрос доступа к микрофону и настройка анализа звука
    const requestMicAccess = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setMicPermission(true);

            // Создаем аудио контекст
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 256;

            sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
            sourceRef.current.connect(analyserRef.current);

            setMicActive(true);

            // Запускаем анализ звука
            const bufferLength = analyserRef.current.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const checkBlow = () => {
                if (!analyserRef.current || !micActive) return;

                analyserRef.current.getByteFrequencyData(dataArray);

                // Вычисляем среднюю громкость
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) {
                    sum += dataArray[i];
                }
                const average = sum / bufferLength;

                // Нормализуем значение (0-1)
                const normalized = Math.min(average / 200, 1);
                setBlowPower(normalized);

                // Если дуют сильно, гасим свечи
                if (normalized > 0.3) {
                    setCandlesLit(prev => {
                        // Если все свечи уже погашены, ничего не делаем
                        if (prev.every(v => !v)) return prev;

                        // Гасим по одной свече в зависимости от силы дутья
                        const firstLitIndex = prev.findIndex(v => v);
                        if (firstLitIndex !== -1) {
                            const newCandles = [...prev];
                            newCandles[firstLitIndex] = false;
                            return newCandles;
                        }
                        return prev;
                    });
                }

                animationFrameRef.current = requestAnimationFrame(checkBlow);
            };

            checkBlow();

        } catch (err) {
            console.error('Микрофон не доступен:', err);
            setMicPermission(false);
        }
    };

    const openGift = () => {
        setIsOpen(true);
        const newConfetti = [];
        for (let i = 0; i < 150; i++) {
            newConfetti.push({
                id: i,
                left: Math.random() * 100,
                top: -20,
                size: Math.random() * 12 + 5,
                color: `hsl(${Math.random() * 360}, 100%, 60%)`,
                duration: Math.random() * 3 + 2,
                delay: Math.random() * 0.5,
                rotation: Math.random() * 360,
            });
        }
        setConfetti(newConfetti);
        setTimeout(() => setConfetti([]), 4000);
    };

    if (!mounted) {
        return (
            <div style={{
                width: '100%',
                minHeight: '100vh',
                background: 'radial-gradient(circle at 20% 20%, #2b1b3a, #0f0c1f)',
            }} />
        );
    }

    return (
        <div style={{
            position: 'relative',
            width: '100%',
            minHeight: '100vh',
            overflow: 'hidden',
            background: 'radial-gradient(circle at 20% 20%, #2b1b3a, #0f0c1f)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
        }}>
            {/* Звезды */}
            {stars.map((star) => (
                <div
                    key={star.id}
                    style={{
                        position: 'absolute',
                        left: star.left + '%',
                        top: star.top + '%',
                        width: star.size + 'px',
                        height: star.size + 'px',
                        background: 'white',
                        borderRadius: '50%',
                        opacity: 0.5,
                        animation: `twinkle ${star.duration}s infinite`,
                        boxShadow: '0 0 10px rgba(255,255,255,0.5)',
                    }}
                />
            ))}

            {/* Конфетти */}
            {confetti.map((c) => (
                <div
                    key={c.id}
                    style={{
                        position: 'fixed',
                        left: c.left + '%',
                        top: c.top + 'px',
                        width: c.size + 'px',
                        height: c.size + 'px',
                        background: c.color,
                        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                        transform: `rotate(${c.rotation}deg)`,
                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                        zIndex: 200,
                        animation: `fall ${c.duration}s linear ${c.delay}s forwards`,
                        pointerEvents: 'none',
                    }}
                />
            ))}

            {/* Затемнение */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.85)',
                            zIndex: 20,
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Главный контент */}
            <div style={{
                position: 'relative',
                zIndex: 10,
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
            }}>
                {/* Заголовок */}
                <motion.h1
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
                    style={{
                        fontSize: 'clamp(2.5rem, 10vw, 6rem)',
                        fontWeight: 900,
                        textAlign: 'center',
                        marginBottom: '3rem',
                        background: 'linear-gradient(135deg, #FFD700, #FFA500, #FF69B4)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textShadow: '0 0 30px rgba(255,215,0,0.5)',
                        letterSpacing: '2px',
                        lineHeight: 1.2,
                    }}
                >
                    С Днём Рождения,<br />Папа!
                </motion.h1>

                {/* Весь подарок целиком */}
                <motion.div
                    onHoverStart={() => setHover(true)}
                    onHoverEnd={() => setHover(false)}
                    animate={!isOpen && hover ? {
                        rotate: [0, 2, -2, 2, 0],
                        scale: 1.03
                    } : {
                        rotate: 0,
                        scale: 1
                    }}
                    transition={{ duration: 0.5 }}
                    style={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: 'min(600px, 90vw)',
                        margin: '0 auto',
                        cursor: !isOpen ? 'pointer' : 'default',
                    }}
                    onClick={!isOpen ? openGift : undefined}
                >
                    {/* Крышка подарка */}
                    <AnimatePresence>
                        {!isOpen && (
                            <motion.div
                                exit={{
                                    y: -250,
                                    rotate: 25,
                                    opacity: 0,
                                    transition: { duration: 0.8, type: 'spring', bounce: 0.3 }
                                }}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    zIndex: 30,
                                    transform: 'translateY(-45%)',
                                }}
                            >
                                <div style={{
                                    width: '100%',
                                    height: '90px',
                                    background: 'linear-gradient(180deg, #ff6b6b, #c92a2a)',
                                    borderRadius: '25px 25px 0 0',
                                    borderBottom: '8px solid #9b2c2c',
                                    position: 'relative',
                                    boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                    }}>
                                        <div style={{
                                            width: '70px',
                                            height: '70px',
                                            background: 'radial-gradient(circle at 30% 30%, #FFD700, #B8860B)',
                                            borderRadius: '50%',
                                            boxShadow: '0 8px 20px rgba(0,0,0,0.3), inset 0 2px 10px rgba(255,255,255,0.5)',
                                            position: 'relative',
                                        }}>
                                            <div style={{
                                                position: 'absolute',
                                                left: '-25px',
                                                top: '50%',
                                                transform: 'translateY(-50%) rotate(-15deg)',
                                                width: '40px',
                                                height: '30px',
                                                background: 'linear-gradient(135deg, #FFD700, #B8860B)',
                                                borderRadius: '50%',
                                                boxShadow: 'inset 0 2px 5px rgba(255,255,255,0.5)',
                                            }} />
                                            <div style={{
                                                position: 'absolute',
                                                right: '-25px',
                                                top: '50%',
                                                transform: 'translateY(-50%) rotate(15deg)',
                                                width: '40px',
                                                height: '30px',
                                                background: 'linear-gradient(135deg, #FFD700, #B8860B)',
                                                borderRadius: '50%',
                                                boxShadow: 'inset 0 2px 5px rgba(255,255,255,0.5)',
                                            }} />
                                            <div style={{
                                                position: 'absolute',
                                                top: '-20px',
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                                width: '30px',
                                                height: '30px',
                                                background: 'radial-gradient(circle at 30% 30%, #FFF, #FFD700)',
                                                borderRadius: '50%',
                                                boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                                            }} />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Основание подарка */}
                    <div style={{
                        position: 'relative',
                        filter: isOpen ? 'brightness(0.8)' : 'none',
                        transition: 'filter 0.3s',
                    }}>
                        <div style={{
                            width: '100%',
                            aspectRatio: '1/1',
                            background: 'linear-gradient(145deg, #ff6b6b, #c92a2a)',
                            borderRadius: '40px',
                            boxShadow: isOpen
                                ? '0 20px 30px rgba(0,0,0,0.5)'
                                : '0 30px 40px rgba(0,0,0,0.4), inset 0 2px 10px rgba(255,255,255,0.3)',
                            position: 'relative',
                            overflow: 'hidden',
                            transition: 'box-shadow 0.3s',
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.2) 0%, transparent 50%)',
                            }} />

                            <div style={{
                                position: 'absolute',
                                left: '50%',
                                top: 0,
                                bottom: 0,
                                width: '70px',
                                transform: 'translateX(-50%)',
                                background: 'linear-gradient(90deg, #FFD700, #FDB931, #FFD700)',
                                zIndex: 10,
                                boxShadow: '0 0 20px rgba(255,215,0,0.3), inset 0 2px 10px rgba(255,255,255,0.5)',
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: 'repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(255,255,255,0.2) 10px, rgba(255,255,255,0.2) 20px)',
                                }} />
                            </div>

                            <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: 0,
                                right: 0,
                                height: '70px',
                                transform: 'translateY(-50%)',
                                background: 'linear-gradient(180deg, #FFD700, #FDB931, #FFD700)',
                                zIndex: 10,
                                boxShadow: '0 0 20px rgba(255,215,0,0.3), inset 0 2px 10px rgba(255,255,255,0.5)',
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: 'repeating-linear-gradient(180deg, transparent, transparent 10px, rgba(255,255,255,0.2) 10px, rgba(255,255,255,0.2) 20px)',
                                }} />
                            </div>

                            <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                zIndex: 20,
                            }}>
                                <div style={{
                                    width: '120px',
                                    height: '120px',
                                    background: 'radial-gradient(circle at 30% 30%, #FFD700, #B8860B)',
                                    borderRadius: '50%',
                                    boxShadow: '0 15px 30px rgba(0,0,0,0.3), inset 0 3px 15px rgba(255,255,255,0.6)',
                                    position: 'relative',
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        left: '-30px',
                                        top: '50%',
                                        transform: 'translateY(-50%) rotate(-15deg)',
                                        width: '50px',
                                        height: '40px',
                                        background: 'linear-gradient(135deg, #FFD700, #B8860B)',
                                        borderRadius: '50%',
                                        boxShadow: 'inset 0 3px 10px rgba(255,255,255,0.5)',
                                    }} />
                                    <div style={{
                                        position: 'absolute',
                                        right: '-30px',
                                        top: '50%',
                                        transform: 'translateY(-50%) rotate(15deg)',
                                        width: '50px',
                                        height: '40px',
                                        background: 'linear-gradient(135deg, #FFD700, #B8860B)',
                                        borderRadius: '50%',
                                        boxShadow: 'inset 0 3px 10px rgba(255,255,255,0.5)',
                                    }} />
                                    <div style={{
                                        position: 'absolute',
                                        top: '-25px',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        width: '40px',
                                        height: '40px',
                                        background: 'radial-gradient(circle at 30% 30%, #FFF, #FFD700)',
                                        borderRadius: '50%',
                                        boxShadow: '0 8px 15px rgba(0,0,0,0.2)',
                                    }} />
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '-25px',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        width: '35px',
                                        height: '35px',
                                        background: 'radial-gradient(circle at 30% 30%, #FFF, #FFD700)',
                                        borderRadius: '50%',
                                        boxShadow: '0 8px 15px rgba(0,0,0,0.2)',
                                    }} />
                                </div>
                            </div>

                            {!isOpen && (
                                <motion.div
                                    animate={{
                                        scale: [1, 1.15, 1],
                                        opacity: [0.9, 1, 0.9],
                                    }}
                                    transition={{
                                        duration: 1.8,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                    style={{
                                        position: 'absolute',
                                        bottom: '40px',
                                        left: 0,
                                        right: 0,
                                        textAlign: 'center',
                                        zIndex: 30,
                                    }}
                                >
                  <span style={{
                      display: 'inline-block',
                      background: 'rgba(0,0,0,0.5)',
                      backdropFilter: 'blur(5px)',
                      color: 'white',
                      fontSize: 'clamp(1.3rem, 4vw, 2rem)',
                      fontWeight: 'bold',
                      padding: '15px 45px',
                      borderRadius: '60px',
                      border: '2px solid rgba(255,215,0,0.8)',
                      boxShadow: '0 0 30px rgba(255,215,0,0.3)',
                      letterSpacing: '2px',
                  }}>
                    ✨ ОТКРЫТЬ ✨
                  </span>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Торт со свечами - появляется после открытия подарка */}
                <AnimatePresence>
                    {showCake && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
                            style={{
                                marginTop: '50px',
                                width: '100%',
                                maxWidth: '500px',
                            }}
                        >
                            {/* Индикатор дутья */}
                            {micActive && (
                                <div style={{
                                    width: '100%',
                                    height: '10px',
                                    background: 'rgba(255,255,255,0.2)',
                                    borderRadius: '10px',
                                    marginBottom: '20px',
                                    overflow: 'hidden',
                                }}>
                                    <motion.div
                                        animate={{ width: `${blowPower * 100}%` }}
                                        style={{
                                            height: '100%',
                                            background: 'linear-gradient(90deg, #FFD700, #FFA500)',
                                            borderRadius: '10px',
                                        }}
                                    />
                                </div>
                            )}

                            {/* Кнопка для запроса микрофона */}
                            {micPermission === null && !micActive && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={requestMicAccess}
                                    style={{
                                        background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                                        color: '#1a1a2e',
                                        border: 'none',
                                        padding: '15px 30px',
                                        fontSize: '1.2rem',
                                        fontWeight: 'bold',
                                        borderRadius: '50px',
                                        cursor: 'pointer',
                                        marginBottom: '30px',
                                        boxShadow: '0 10px 25px rgba(0,0,0,0.3), 0 0 20px gold',
                                    }}
                                >
                                    🎤 Разрешить микрофон (чтобы тушить свечи)
                                </motion.button>
                            )}

                            {/* Сам торт */}
                            <div style={{
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                            }}>
                                {/* Свечи */}
                                <div style={{
                                    display: 'flex',
                                    gap: '15px',
                                    marginBottom: '10px',
                                    zIndex: 5,
                                }}>
                                    {candlesLit.map((isLit, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ y: -20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: index * 0.1 }}
                                            style={{
                                                position: 'relative',
                                                width: '25px',
                                                height: '80px',
                                            }}
                                        >
                                            {/* Свеча */}
                                            <div style={{
                                                width: '25px',
                                                height: '60px',
                                                background: 'linear-gradient(135deg, #87CEEB, #4169E1)',
                                                borderRadius: '5px 5px 0 0',
                                                position: 'absolute',
                                                bottom: 0,
                                                boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
                                            }}>
                                                {/* Фитиль */}
                                                <div style={{
                                                    width: '4px',
                                                    height: '8px',
                                                    background: '#333',
                                                    position: 'absolute',
                                                    top: '-4px',
                                                    left: '50%',
                                                    transform: 'translateX(-50%)',
                                                }} />
                                            </div>

                                            {/* Огонь (если свеча горит) */}
                                            {isLit && (
                                                <motion.div
                                                    animate={{
                                                        scale: [1, 1.2, 1],
                                                        opacity: [0.8, 1, 0.8],
                                                    }}
                                                    transition={{
                                                        duration: 0.3,
                                                        repeat: Infinity,
                                                    }}
                                                    style={{
                                                        width: '20px',
                                                        height: '30px',
                                                        background: 'radial-gradient(circle at 30% 30%, #FFD700, #FF4500)',
                                                        borderRadius: '50% 50% 20% 20%',
                                                        position: 'absolute',
                                                        top: '-25px',
                                                        left: '2px',
                                                        filter: 'blur(1px)',
                                                        boxShadow: '0 0 20px #FFA500',
                                                    }}
                                                />
                                            )}
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Торт (ярусы) */}
                                <div style={{
                                    width: '100%',
                                    background: 'linear-gradient(135deg, #D2691E, #8B4513)',
                                    borderRadius: '20px 20px 10px 10px',
                                    padding: '20px',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                                    position: 'relative',
                                    zIndex: 2,
                                }}>
                                    {/* Крем */}
                                    <div style={{
                                        position: 'absolute',
                                        top: -10,
                                        left: 0,
                                        right: 0,
                                        height: '20px',
                                        background: 'repeating-linear-gradient(45deg, #FFFDD0, #FFFDD0 10px, #F0E68C 10px, #F0E68C 20px)',
                                        borderRadius: '10px 10px 0 0',
                                    }} />

                                    {/* Вишенка */}
                                    <div style={{
                                        position: 'absolute',
                                        top: -15,
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        width: '30px',
                                        height: '30px',
                                        background: 'radial-gradient(circle at 30% 30%, #FF0000, #8B0000)',
                                        borderRadius: '50%',
                                        boxShadow: '0 5px 10px rgba(0,0,0,0.3)',
                                    }} />

                                    <p style={{
                                        textAlign: 'center',
                                        color: '#FFFDD0',
                                        fontSize: '1.5rem',
                                        fontWeight: 'bold',
                                        textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                                    }}>
                                        🎂 С Днём Рождения! 🎂
                                    </p>
                                </div>

                                {/* Сообщение о потушенных свечах */}
                                {candlesLit.every(v => !v) && (
                                    <motion.p
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        style={{
                                            marginTop: '20px',
                                            color: '#FFD700',
                                            fontSize: '1.5rem',
                                            fontWeight: 'bold',
                                            textShadow: '0 0 20px gold',
                                        }}
                                    >
                                        ✨ Желание загадано! ✨
                                    </motion.p>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Подсказка */}
                {!isOpen && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.7 }}
                        transition={{ delay: 1 }}
                        style={{
                            position: 'absolute',
                            bottom: '30px',
                            color: 'rgba(255,255,255,0.5)',
                            fontSize: '1rem',
                            letterSpacing: '1px',
                        }}
                    >
                        Нажми на подарок 🎁
                    </motion.p>
                )}
            </div>

            {/* ПОЗДРАВЛЕНИЕ ПО ЦЕНТРУ */}
            <AnimatePresence>
                {isOpen && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                        pointerEvents: 'none',
                    }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.3 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.3 }}
                            transition={{
                                type: 'spring',
                                bounce: 0.5,
                                delay: 0.3,
                                duration: 0.7
                            }}
                            style={{
                                width: '90%',
                                maxWidth: '650px',
                                pointerEvents: 'auto',
                            }}
                        >
                            <div style={{
                                background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
                                borderRadius: '60px',
                                padding: 'clamp(30px, 5vw, 50px) clamp(30px, 5vw, 40px)',
                                boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 3px #FFD700, 0 0 50px #FFD700',
                                position: 'relative',
                                overflow: 'hidden',
                                width: '100%',
                            }}>
                                {/* Искры */}
                                {[...Array(20)].map((_, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            position: 'absolute',
                                            width: '4px',
                                            height: '4px',
                                            background: '#FFD700',
                                            borderRadius: '50%',
                                            left: Math.random() * 100 + '%',
                                            top: Math.random() * 100 + '%',
                                            boxShadow: '0 0 20px gold',
                                            animation: `sparkle ${Math.random() * 2 + 1}s infinite`,
                                        }}
                                    />
                                ))}

                                <div style={{ position: 'relative', zIndex: 10 }}>
                                    <motion.h2
                                        initial={{ y: 30, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                        style={{
                                            fontSize: 'clamp(2rem, 6vw, 4rem)',
                                            fontWeight: 900,
                                            textAlign: 'center',
                                            marginBottom: 'clamp(20px, 4vw, 30px)',
                                            background: 'linear-gradient(135deg, #FFD700, #FFA500, #FF69B4)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            textShadow: '0 0 30px rgba(255,215,0,0.3)',
                                            lineHeight: 1.2,
                                        }}
                                    >
                                        🎉 С ДНЁМ РОЖДЕНИЯ! 🎉
                                    </motion.h2>

                                    <motion.div
                                        initial={{ y: 30, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.7 }}
                                        style={{
                                            textAlign: 'center',
                                            color: '#fff',
                                        }}
                                    >
                                        <p style={{
                                            fontSize: 'clamp(1.3rem, 4vw, 2rem)',
                                            marginBottom: '20px',
                                            fontWeight: 'bold',
                                            textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                                        }}>
                                            <span style={{ color: '#FFD700' }}>Папа!</span> Ты лучший!
                                        </p>

                                        <p style={{
                                            fontSize: 'clamp(1rem, 3vw, 1.3rem)',
                                            marginBottom: '20px',
                                            lineHeight: 1.6,
                                            color: 'rgba(255,255,255,0.9)',
                                        }}>
                                            Спасибо за твою заботу, тепло и поддержку.<br />
                                            Ты всегда рядом и это бесценно.
                                        </p>

                                        <p style={{
                                            fontSize: 'clamp(1.1rem, 3.5vw, 1.5rem)',
                                            marginBottom: '30px',
                                            color: '#FFD700',
                                            fontWeight: 'bold',
                                            textShadow: '0 0 15px rgba(255,215,0,0.5)',
                                        }}>
                                            Крепкого здоровья, счастья<br />
                                            и исполнения всех желаний!
                                        </p>

                                        <p style={{
                                            fontSize: 'clamp(1.4rem, 5vw, 2.2rem)',
                                            fontWeight: 900,
                                            marginBottom: '35px',
                                            background: 'linear-gradient(135deg, #FF69B4, #FFD700)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                        }}>
                                            ❤️ Я ТЕБЯ ОЧЕНЬ ЛЮБЛЮ! ❤️
                                        </p>
                                    </motion.div>

                                    <motion.button
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 1 }}
                                        onClick={() => setIsOpen(false)}
                                        style={{
                                            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                                            color: '#1a1a2e',
                                            border: 'none',
                                            padding: '15px 50px',
                                            fontSize: '1.3rem',
                                            fontWeight: 'bold',
                                            borderRadius: '50px',
                                            cursor: 'pointer',
                                            display: 'block',
                                            margin: '0 auto',
                                            boxShadow: '0 10px 25px rgba(0,0,0,0.3), 0 0 20px gold',
                                            transition: 'all 0.3s',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.transform = 'scale(1.05)';
                                            e.target.style.boxShadow = '0 15px 35px rgba(0,0,0,0.4), 0 0 30px gold';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.transform = 'scale(1)';
                                            e.target.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3), 0 0 20px gold';
                                        }}
                                    >
                                        Закрыть
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Стили */}
            <style jsx>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
          }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.8; }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
        </div>
    );
}