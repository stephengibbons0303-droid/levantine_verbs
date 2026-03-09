export default function Lightsaber({ level, maxLevel }) {
  const fillPct = maxLevel > 0 ? Math.min(100, Math.max(0, (level / maxLevel) * 100)) : 0;
  const isFull = fillPct >= 100;

  return (
    <div className="lightsaber-container">
      <div className="lightsaber-blade-container">
        <div
          className={`lightsaber-blade ${isFull ? 'pulse' : ''}`}
          style={{ height: `${fillPct}%` }}
        />
        <div className="lightsaber-core" style={{ height: `${fillPct}%` }} />
      </div>
      <div className="lightsaber-emitter" />
      <div className="lightsaber-handle" />
      <div className="level-text">{Math.round(fillPct)}%</div>
    </div>
  );
}
