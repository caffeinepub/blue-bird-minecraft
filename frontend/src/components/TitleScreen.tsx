interface TitleScreenProps {
  onPlay: () => void;
}

export default function TitleScreen({ onPlay }: TitleScreenProps) {
  const year = new Date().getFullYear();
  const appId = encodeURIComponent(typeof window !== 'undefined' ? window.location.hostname : 'bluebird-craft');

  return (
    <div className="title-screen">
      {/* Background image */}
      <div
        className="title-bg"
        style={{ backgroundImage: 'url(/assets/generated/title-bg.dim_1280x720.png)' }}
      />

      {/* Dark overlay */}
      <div className="title-overlay" />

      {/* Content */}
      <div className="title-content">
        {/* Bird sprite */}
        <div className="title-bird-container">
          <img
            src="/assets/generated/blue-bird-sprite.dim_128x128.png"
            alt="Blue Bird"
            className="title-bird-sprite"
          />
        </div>

        {/* Title */}
        <h1 className="title-heading">
          <span className="title-blue">Blue</span>
          <span className="title-white">Bird</span>
          <span className="title-green">Craft</span>
        </h1>

        <p className="title-subtitle">Fly through the blocky world!</p>

        {/* Grass block decorations */}
        <div className="title-blocks">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="title-block"
              style={{
                backgroundImage: 'url(/assets/generated/grass-block-tile.dim_64x64.png)',
                backgroundSize: 'cover',
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>

        {/* Play button */}
        <button className="play-button" onClick={onPlay}>
          ▶ PLAY GAME
        </button>

        {/* Instructions preview */}
        <div className="title-instructions">
          <span>WASD / Arrows to move</span>
          <span className="title-sep">•</span>
          <span>SPACE to flap & fly</span>
        </div>
      </div>

      {/* Footer */}
      <footer className="title-footer">
        <span>© {year} BlueBirdCraft</span>
        <span className="title-sep">•</span>
        <span>
          Built with{' '}
          <span className="footer-heart">♥</span>{' '}
          using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            caffeine.ai
          </a>
        </span>
      </footer>
    </div>
  );
}
