export default function Modal({ kicker, title, intro, onClose, children }) {
  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <section className="record-modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-heading">
          <div>
            <div className="section-kicker">{kicker}</div>
            <h2>{title}</h2>
          </div>
          <button className="close-button" aria-label="Close" onClick={onClose}>×</button>
        </div>
        {intro && <p className="modal-intro">{intro}</p>}
        {children}
      </section>
    </div>
  );
}
