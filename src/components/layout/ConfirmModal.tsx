import type { ModalData } from '../../types/auth';

interface ConfirmModalProps {
  data: ModalData | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ data, onConfirm, onCancel }) => {
  if (!data) return null;

  return (
    <div className="sv-modal-overlay">
      <div className="sv-modal-backdrop" onClick={onCancel} />
      <div className="sv-modal">
        <div className="sv-corner sv-corner-tl" />
        <div className="sv-corner sv-corner-tr" />
        <div className="sv-corner sv-corner-bl" />
        <div className="sv-corner sv-corner-br" />

        <div className="sv-modal-header">
          <div className="sv-modal-icon">&#9632;</div>
          <h3 className="sv-modal-title">CONFIRM DATA</h3>
          <p className="sv-modal-sub">VERIFY INFORMATION IS CORRECT</p>
        </div>

        <div className="sv-modal-data">
          <div className="sv-modal-row">
            <span className="sv-modal-row-label">CURP</span>
            <span className="sv-modal-row-value">{data.data.curp}</span>
          </div>
          <div className="sv-modal-row">
            <span className="sv-modal-row-label">NAME</span>
            <span className="sv-modal-row-value">{data.data.name}</span>
          </div>
          <div className="sv-modal-row">
            <span className="sv-modal-row-label">SURNAMES</span>
            <span className="sv-modal-row-value">{data.data.lastNameA} {data.data.lastNameB}</span>
          </div>
          <div className="sv-modal-row">
            <span className="sv-modal-row-label">AGE</span>
            <span className="sv-modal-row-value">{data.age} YRS</span>
          </div>
          <div className="sv-modal-row">
            <span className="sv-modal-row-label">GENDER</span>
            <span className="sv-modal-row-value">{data.data.gender}</span>
          </div>
        </div>

        <div className="sv-modal-actions">
          <button className="sv-btn sv-btn-danger" onClick={onCancel}>DISCARD</button>
          <button className="sv-btn sv-btn-success" onClick={onConfirm}>CONFIRM</button>
        </div>
      </div>
    </div>
  );
};
