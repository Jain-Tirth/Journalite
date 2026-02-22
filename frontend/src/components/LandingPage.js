import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import './LandingPage.css';

const LandingPage = () => {
    const { currentUser } = useAuth();
    const heroRef = useRef(null);
    const featuresRef = useRef(null);
    const howItWorksRef = useRef(null);
    const testimonialsRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('lp-visible');
                    }
                });
            },
            { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
        );

        document.querySelectorAll('.lp-animate').forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    // Remove body padding/margin that exists for the app navbar
    useEffect(() => {
        const body = document.body;
        const origPaddingTop = body.style.paddingTop;
        const origMarginTop = body.style.marginTop;
        body.style.paddingTop = '0px';
        body.style.marginTop = '0px';
        return () => {
            body.style.paddingTop = origPaddingTop;
            body.style.marginTop = origMarginTop;
        };
    }, []);

    /* If already logged in, redirect handled by App.js */

    return (
        <div className="lp-root">
            {/* ─── Navbar Override (transparent for landing) ─── */}

            {/* ═══════════════════ HERO ═══════════════════ */}
            <section className="lp-hero" ref={heroRef}>
                {/* Background decoration */}
                <div className="lp-hero__orb lp-hero__orb--1" aria-hidden="true"></div>
                <div className="lp-hero__orb lp-hero__orb--2" aria-hidden="true"></div>
                <div className="lp-hero__dots" aria-hidden="true"></div>

                <Container>
                    <Row className="align-items-center min-vh-80">
                        <Col lg={6} className="lp-hero__content">
                            <div className="lp-badge lp-animate">
                                <i className="bi bi-stars me-2"></i>
                                AI-Powered Journaling
                            </div>
                            <h1 className="lp-hero__title lp-animate">
                                Your thoughts,<br />
                                <span className="lp-gradient-text">beautifully captured.</span>
                            </h1>
                            <p className="lp-hero__subtitle lp-animate">
                                Journalite is the intelligent journal that understands your moods,
                                reveals patterns in your thinking, and helps you grow — one entry at a time.
                            </p>
                            <div className="lp-hero__cta lp-animate">
                                {currentUser ? (
                                    <Button as={Link} to="/dashboard" className="lp-btn lp-btn--primary" size="lg">
                                        Go to Dashboard
                                        <i className="bi bi-arrow-right ms-2"></i>
                                    </Button>
                                ) : (
                                    <>
                                        <Button as={Link} to="/register" className="lp-btn lp-btn--primary" size="lg">
                                            Start Journaling Free
                                            <i className="bi bi-arrow-right ms-2"></i>
                                        </Button>
                                        <Button as={Link} to="/login" className="lp-btn lp-btn--ghost" size="lg">
                                            Sign In
                                        </Button>
                                    </>
                                )}
                            </div>
                            <div className="lp-hero__trust lp-animate">
                                <div className="lp-trust-avatars">
                                    <span className="lp-trust-avatar" style={{ '--hue': '160' }}>J</span>
                                    <span className="lp-trust-avatar" style={{ '--hue': '30' }}>A</span>
                                    <span className="lp-trust-avatar" style={{ '--hue': '220' }}>M</span>
                                    <span className="lp-trust-avatar" style={{ '--hue': '280' }}>K</span>
                                </div>
                                <span className="lp-trust-text">Trusted by thoughtful writers everywhere</span>
                            </div>
                        </Col>
                        <Col lg={6} className="d-none d-lg-block">
                            <div className="lp-hero__visual lp-animate">
                                {/* Floating journal mockup */}
                                <div className="lp-mockup">
                                    <div className="lp-mockup__header">
                                        <span className="lp-mockup__dot"></span>
                                        <span className="lp-mockup__dot"></span>
                                        <span className="lp-mockup__dot"></span>
                                    </div>
                                    <div className="lp-mockup__body">
                                        <div className="lp-mockup__date">February 22, 2026</div>
                                        <div className="lp-mockup__title-line">A beautiful morning walk 🌿</div>
                                        <div className="lp-mockup__line lp-mockup__line--full"></div>
                                        <div className="lp-mockup__line lp-mockup__line--full"></div>
                                        <div className="lp-mockup__line lp-mockup__line--med"></div>
                                        <div className="lp-mockup__mood">
                                            <span className="lp-mockup__mood-tag lp-mockup__mood-tag--happy">😊 Happy</span>
                                            <span className="lp-mockup__mood-tag lp-mockup__mood-tag--calm">🧘 Calm</span>
                                        </div>
                                        <div className="lp-mockup__ai">
                                            <i className="bi bi-magic me-1"></i>
                                            <span>AI detected: Gratitude, Mindfulness</span>
                                        </div>
                                    </div>
                                </div>
                                {/* Floating cards */}
                                <div className="lp-float-card lp-float-card--insight">
                                    <i className="bi bi-graph-up-arrow"></i>
                                    <span>Your happiness is up 23% this week</span>
                                </div>
                                <div className="lp-float-card lp-float-card--streak">
                                    <i className="bi bi-fire"></i>
                                    <span>7 day streak!</span>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* ═══════════════════ FEATURES ═══════════════════ */}
            <section className="lp-features" ref={featuresRef} id="features">
                <Container>
                    <div className="text-center mb-5">
                        <h2 className="lp-section-title lp-animate">
                            Everything you need to<br />
                            <span className="lp-gradient-text">journal mindfully</span>
                        </h2>
                        <p className="lp-section-subtitle lp-animate">
                            Powerful features designed to make self-reflection effortless and meaningful.
                        </p>
                    </div>

                    <Row className="g-4">
                        {[
                            {
                                icon: 'bi-emoji-smile',
                                title: 'AI Mood Detection',
                                description: 'Our AI reads between the lines to detect your mood, giving you insights into your emotional journey over time.',
                                color: '--primary',
                            },
                            {
                                icon: 'bi-lock-fill',
                                title: 'End-to-End Encryption',
                                description: 'Your thoughts stay yours. Every entry is encrypted before it leaves your device so only you can ever read them.',
                                color: '--secondary',
                            },
                            {
                                icon: 'bi-graph-up',
                                title: 'Deep Insights',
                                description: 'Visualize your writing patterns, mood trends, and emotional growth with beautiful charts and analytics.',
                                color: '--info',
                            },
                            {
                                icon: 'bi-palette',
                                title: 'Writing Themes',
                                description: 'Choose from immersive writing themes — Midnight Ink, Sunset Meadow, Ocean Depths — that match your mood.',
                                color: '--mood-grateful',
                            },
                            {
                                icon: 'bi-images',
                                title: 'Photo Memories',
                                description: 'Attach photos to your entries. Every image tells a story that words alone can\'t capture.',
                                color: '--mood-excited',
                            },
                            {
                                icon: 'bi-tags',
                                title: 'Smart Tagging',
                                description: 'Organize your entries with tags and find any memory instantly with powerful search and filtering.',
                                color: '--mood-calm',
                            },
                        ].map((feature, i) => (
                            <Col md={6} lg={4} key={i}>
                                <div className="lp-feature-card lp-animate" style={{ '--delay': `${i * 0.1}s` }}>
                                    <div className="lp-feature-icon" style={{ '--feature-color': `var(${feature.color})` }}>
                                        <i className={`bi ${feature.icon}`}></i>
                                    </div>
                                    <h3 className="lp-feature-title">{feature.title}</h3>
                                    <p className="lp-feature-desc">{feature.description}</p>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* ═══════════════════ HOW IT WORKS ═══════════════════ */}
            <section className="lp-how" ref={howItWorksRef} id="how-it-works">
                <Container>
                    <div className="text-center mb-5">
                        <h2 className="lp-section-title lp-animate">
                            Three steps to a<br />
                            <span className="lp-gradient-text">richer inner life</span>
                        </h2>
                    </div>

                    <Row className="g-4 justify-content-center">
                        {[
                            {
                                step: '01',
                                icon: 'bi-pen',
                                title: 'Write',
                                description: 'Open Journalite and pour your thoughts out. Pick a theme, set your mood, and let the words flow.',
                            },
                            {
                                step: '02',
                                icon: 'bi-cpu',
                                title: 'Reflect',
                                description: 'Our AI analyzes your entry behind the scenes — detecting emotions, themes, and patterns you might miss.',
                            },
                            {
                                step: '03',
                                icon: 'bi-lightbulb',
                                title: 'Grow',
                                description: 'Review your insights dashboard to see how you\'re evolving. Spot trends, celebrate streaks, and grow.',
                            },
                        ].map((step, i) => (
                            <Col md={4} key={i}>
                                <div className="lp-step lp-animate" style={{ '--delay': `${i * 0.15}s` }}>
                                    <div className="lp-step__number">{step.step}</div>
                                    <div className="lp-step__icon">
                                        <i className={`bi ${step.icon}`}></i>
                                    </div>
                                    <h3 className="lp-step__title">{step.title}</h3>
                                    <p className="lp-step__desc">{step.description}</p>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* ═══════════════════ TESTIMONIALS ═══════════════════ */}
            <section className="lp-testimonials" ref={testimonialsRef}>
                <Container>
                    <div className="text-center mb-5">
                        <h2 className="lp-section-title lp-animate">
                            Loved by <span className="lp-gradient-text">real writers</span>
                        </h2>
                    </div>

                    <Row className="g-4 justify-content-center">
                        {[
                            {
                                quote: 'Journalite helped me understand my anxiety triggers. The mood tracking is like having a therapist in your pocket.',
                                name: 'Priya K.',
                                role: 'Student',
                                avatar: 'P',
                                hue: 280,
                            },
                            {
                                quote: 'I\'ve tried dozens of journal apps. Journalite is the only one that stuck — the writing themes make it feel special.',
                                name: 'Marcus L.',
                                role: 'Designer',
                                avatar: 'M',
                                hue: 160,
                            },
                            {
                                quote: 'The encryption gives me peace of mind. I can be truly honest in my entries knowing they\'re private.',
                                name: 'Aisha R.',
                                role: 'Therapist',
                                avatar: 'A',
                                hue: 30,
                            },
                        ].map((t, i) => (
                            <Col md={4} key={i}>
                                <div className="lp-testimonial lp-animate" style={{ '--delay': `${i * 0.12}s` }}>
                                    <div className="lp-testimonial__stars">
                                        {[...Array(5)].map((_, j) => (
                                            <i key={j} className="bi bi-star-fill"></i>
                                        ))}
                                    </div>
                                    <p className="lp-testimonial__quote">"{t.quote}"</p>
                                    <div className="lp-testimonial__author">
                                        <span className="lp-trust-avatar" style={{ '--hue': t.hue }}>{t.avatar}</span>
                                        <div>
                                            <strong>{t.name}</strong>
                                            <small>{t.role}</small>
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* ═══════════════════ CTA ═══════════════════ */}
            <section className="lp-cta">
                <Container>
                    <div className="lp-cta__card lp-animate">
                        <div className="lp-cta__orb" aria-hidden="true"></div>
                        <h2 className="lp-cta__title">
                            Start your journaling journey today
                        </h2>
                        <p className="lp-cta__subtitle">
                            Free forever. No credit card required. Your thoughts deserve a beautiful home.
                        </p>
                        {currentUser ? (
                            <Button as={Link} to="/dashboard" className="lp-btn lp-btn--white" size="lg">
                                Go to Dashboard
                                <i className="bi bi-arrow-right ms-2"></i>
                            </Button>
                        ) : (
                            <Button as={Link} to="/register" className="lp-btn lp-btn--white" size="lg">
                                Create Your Journal
                                <i className="bi bi-arrow-right ms-2"></i>
                            </Button>
                        )}
                    </div>
                </Container>
            </section>

            {/* ═══════════════════ FOOTER ═══════════════════ */}
            <footer className="lp-footer">
                <Container>
                    <div className="lp-footer__inner">
                        <div className="lp-footer__brand">
                            <i className="bi bi-journal-bookmark me-2"></i>
                            <span className="lp-gradient-text fw-bold">Journalite</span>
                        </div>
                        <p className="lp-footer__copy">
                            © {new Date().getFullYear()} Journalite. Crafted with <i className="bi bi-heart-fill text-danger"></i> for mindful writers.
                        </p>
                    </div>
                </Container>
            </footer>
        </div>
    );
};

export default LandingPage;
