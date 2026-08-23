import logo from '../assets/logo.png'

type PlaceholderProps = { eyebrow: string; title: string; description: string; nextLabel?: string; nextPath?: string; navigate: (to: string) => void }

export default function PlaceholderPage({ eyebrow, title, description, nextLabel, nextPath, navigate }: PlaceholderProps) {
  return <main className="placeholder-page"><header className="site-header"><button className="brand" onClick={() => navigate('/')} aria-label="Back to home" style={{ border: 0, background: 'none', padding: 0 }}><img src={logo} alt="Studio logo" /></button></header><section className="placeholder-content"><div className="placeholder-card"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p><div className="placeholder-actions">{nextLabel && nextPath && <button className="primary-button" onClick={() => navigate(nextPath)}>{nextLabel}</button>}<button className="secondary-button" onClick={() => navigate('/')}>Back to home</button></div></div></section></main>
}
