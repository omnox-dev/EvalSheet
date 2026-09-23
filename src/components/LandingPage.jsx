import React, { useRef, useState } from 'react';
import { 
  Briefcase, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight,
  Upload,
  Flame
} from 'lucide-react';
import { CORPORATE_MEMES as DEFAULT_MEMES } from '../data/memesData';

export default function LandingPage({ onGetStarted }) {
  const scrollRef = useRef(null);
  const [memes, setMemes] = useState(DEFAULT_MEMES);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleCustomImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newMemes = files.map((file, idx) => ({
      id: 'custom-' + Date.now() + '-' + idx,
      image: URL.createObjectURL(file)
    }));

    setMemes(newMemes);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a', display: 'flex', flexDirection: 'column' }}>
      {/* Top Corporate Nav */}
      <header style={{ 
        backgroundColor: '#ffffff', 
        borderBottom: '1px solid #e2e8f0', 
        padding: '0.875rem 2rem', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '0.45rem', borderRadius: '6px', display: 'flex' }}>
            <Briefcase size={18} />
          </div>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#0f172a' }}>
              EvalSheet Enterprise™
            </div>
            <div style={{ fontSize: '0.675rem', fontWeight: 600, color: 'var(--c-accent)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Synergistic Candidate Matrix 3000
            </div>
          </div>
        </div>

        <div>
          <button 
            className="btn btn-primary btn-sm"
            onClick={onGetStarted}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
          >
            <span>Launch Evaluation Portal</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '3rem 2rem 2rem 2rem', 
        display: 'grid', 
        gridTemplateColumns: window.innerWidth < 900 ? '1fr' : '1.15fr 0.85fr', 
        gap: '2.5rem', 
        alignItems: 'center' 
      }}>
        <div>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.4rem', 
            backgroundColor: '#eff6ff', 
            border: '1px solid #bfdbfe', 
            color: '#1d4ed8', 
            padding: '0.35rem 0.85rem', 
            borderRadius: '999px', 
            fontSize: '0.75rem', 
            fontWeight: 700, 
            marginBottom: '1.25rem' 
          }}>
            <Sparkles size={13} />
            <span>Per My Last Evaluation • Zero Low-Hanging Excuses</span>
          </div>

          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1.15, letterSpacing: '-0.03em', color: '#0f172a', marginBottom: '1rem' }}>
            Evaluating talent so you don't circle back into regret.
          </h1>

          <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#475569', marginBottom: '1.75rem' }}>
            The universal, multi-interviewer operating matrix. We synergize candidate Google Form responses, real-time mutex locking, and qualitative rubrics — so HR never has to take anything offline again.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <button 
              className="btn btn-primary"
              onClick={onGetStarted}
              style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <span>Enter Professional Portal</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Corporate Pun Badges */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8rem', color: '#334155' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={15} color="var(--c-accent)" />
              <span><strong>100% Synergized</strong> candidate locking</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={15} color="var(--c-accent)" />
              <span><strong>0 Unread</strong> follow-up threads</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={15} color="var(--c-accent)" />
              <span><strong>Universal</strong> for tech, HR & clubs</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={15} color="var(--c-accent)" />
              <span><strong>Auto-saves</strong> before coffee gets cold</span>
            </div>
          </div>
        </div>

        {/* Hero Visual Card */}
        <div style={{ 
          position: 'relative', 
          backgroundColor: '#0f172a', 
          borderRadius: '12px', 
          padding: '0.75rem', 
          boxShadow: '0 20px 30px -10px rgba(15, 23, 42, 0.25)', 
          border: '1px solid #334155' 
        }}>
          <div style={{ borderRadius: '8px', overflow: 'hidden', backgroundColor: '#020617' }}>
            <img 
              src="/assets/corp_hero.jpg" 
              alt="Corporate Synergy Boardroom" 
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </div>
          <div style={{ padding: '0.75rem 0.5rem 0.25rem 0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.75rem' }}>
            <span>Fig 1.1: C-Suite Executive Matrix Review</span>
            <span style={{ color: '#38bdf8', fontWeight: 600 }}>100% Synergizing Status: Active</span>
          </div>
        </div>
      </section>

      {/* SCROLLABLE MEME IMAGES ONLY SECTION */}
      <section style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', padding: '3rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#d97706', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>
                <Flame size={14} color="#ea580c" />
                <span>Interviewer Stress-Relief Memes</span>
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Corporate & Interview Memes
              </h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input 
                type="file" 
                multiple 
                accept="image/png,image/jpeg,image/jpg,image/webp" 
                id="landing-upload-memes" 
                style={{ display: 'none' }}
                onChange={handleCustomImageUpload}
              />
              <label 
                htmlFor="landing-upload-memes" 
                className="btn btn-secondary btn-sm"
                style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }}
              >
                <Upload size={13} color="var(--c-accent)" />
                <span>Load Your JPG Files</span>
              </label>

              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => handleScroll('left')}
                title="Scroll Left"
                style={{ padding: '0.4rem 0.6rem' }}
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => handleScroll('right')}
                title="Scroll Right"
                style={{ padding: '0.4rem 0.6rem' }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Horizontally Scrollable Cards Container - PURE IMAGES ONLY */}
          <div 
            ref={scrollRef}
            style={{ 
              display: 'flex', 
              gap: '1.25rem', 
              overflowX: 'auto', 
              paddingBottom: '1rem',
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {memes.map((meme, idx) => (
              <div 
                key={meme.id || idx}
                style={{
                  flex: '0 0 340px',
                  height: '380px',
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  scrollSnapAlign: 'start',
                  boxShadow: '0 6px 12px -2px rgba(15, 23, 42, 0.15)',
                  padding: '0.5rem',
                  position: 'relative'
                }}
              >
                <img 
                  src={meme.image} 
                  alt={`Corporate Meme ${idx + 1}`} 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '100%', 
                    objectFit: 'contain', 
                    display: 'block',
                    borderRadius: '8px' 
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ marginTop: 'auto', padding: '1.5rem 2rem', textAlign: 'center', fontSize: '0.775rem', color: '#94a3b8' }}>
        <div>EvalSheet Enterprise • All rights synergized • Touch base responsibly</div>
      </footer>
    </div>
  );
}
