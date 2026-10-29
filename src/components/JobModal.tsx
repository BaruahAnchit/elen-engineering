import type { Job } from '../types';
import { Modal } from './Modal';

interface Props {
  job: Job;
  onClose: () => void;
  onApply: () => void;
}

export function JobModal({ job, onClose, onApply }: Props) {
  return (
    <Modal labelledBy="role-title" onClose={onClose}>
      <span className="tag">
        {job.dept} · {job.level}
      </span>
      <h2 id="role-title">{job.title}</h2>
      <p>
        <b>Location:</b> {job.location}
      </p>
      {job.skills && (
        <p>
          <b>Skills:</b> {job.skills}
        </p>
      )}
      {job.desc && <p>{job.desc}</p>}
      <p>
        <b>Note:</b> This is an illustrative role profile, not a confirmed vacancy.
      </p>
      <button type="button" className="btn primary" onClick={onApply}>
        Apply for this role
      </button>
    </Modal>
  );
}
