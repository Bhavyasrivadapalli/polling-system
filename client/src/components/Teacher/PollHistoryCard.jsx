import OptionBar from "./OptionBar";

export default function PollHistoryCard({ question }) {
  return (
    <div className="question-card">
      <div className="question-title">{question.text}</div>

      <div className="options-wrapper">
        {question.options.map((op, i) => (
          <OptionBar
            key={i}
            text={op.text}
            percent={op.percent}
          />
        ))}
      </div>
    </div>
  );
}
