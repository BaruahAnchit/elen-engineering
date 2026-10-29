export interface Job {
  id: string;
  title: string;
  dept: string;
  level: string;
  location: string;
  skills: string;
  desc: string;
}

export interface Filters {
  q: string;
  dept: string;
  level: string;
  location: string;
}

/** Which dialog is open. `jobId: null` on `apply` means a general application. */
export type ModalState =
  | { kind: 'role'; jobId: string }
  | { kind: 'apply'; jobId: string | null }
  | null;
