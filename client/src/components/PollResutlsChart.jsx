export default function PollResultsChart({ options }) {
  return (
    <div className="results-wrapper">
      {options.map((op, i) => (
        <div key={i} className="result-row">
          <span className="result-label">{op.text}</span>

          <div className="result-bar">
            <div
              className="result-fill"
              style={{ width: `${op.percent}%` }}
            ></div>
          </div>

          <span className="result-percent">{op.percent}%</span>
        </div>
      ))}
    </div>
  );
}
