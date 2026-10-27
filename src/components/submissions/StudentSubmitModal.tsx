import React, { useState } from 'react';
import { UploadCloud, FileCheck, AlertCircle, Loader2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { StudentGroup, Project } from '../../types';
import { api } from '../../services/api';

interface StudentSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: StudentGroup;
  project?: Project;
}

const ALLOWED_EXTS = ['.pdf', '.docx', '.zip', '.pptx'];
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export const StudentSubmitModal: React.FC<StudentSubmitModalProps> = ({
  isOpen,
  onClose,
  group,
  project
}) => {
  const { addToast } = useApp();

  const [milestoneId, setMilestoneId] = useState(
    project?.milestones[0]?.id || ''
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedMilestone = project?.milestones.find((m) => m.id === milestoneId) || project?.milestones[0];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();

      if (!ALLOWED_EXTS.includes(ext)) {
        setErrorMessage(`Invalid file format '${ext}'. Allowed types: ${ALLOWED_EXTS.join(', ')}`);
        setSelectedFile(null);
        return;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        setErrorMessage(`File exceeds 25 MB maximum upload limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`);
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const mId = selectedMilestone?.id || milestoneId;
    if (!mId) {
      setErrorMessage('Please select a target milestone.');
      return;
    }

    if (!selectedFile) {
      setErrorMessage('Please select a deliverable file to upload.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      await api.submissions.upload(
        {
          groupId: group.id,
          milestoneId: mId,
          notes: notes.trim(),
          file: selectedFile
        },
        (percent) => {
          setUploadProgress(percent);
        }
      );

      addToast({
        title: 'Submission Received',
        message: `${selectedFile.name} uploaded successfully for ${selectedMilestone?.title || 'Milestone'}.`,
        type: 'success'
      });

      setSelectedFile(null);
      setNotes('');
      setUploadProgress(0);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'File upload failed. Please verify network connectivity.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Milestone Deliverable"
      subtitle={`Turn in project work for ${group.name}`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Target Project Milestone *
          </label>
          <select
            value={milestoneId}
            onChange={(e) => setMilestoneId(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            {project?.milestones.map((ms) => (
              <option key={ms.id} value={ms.id}>
                Milestone {ms.orderIndex}: {ms.title} (Weightage: {ms.weightage}%)
              </option>
            ))}
          </select>
        </div>

        {/* File Dropzone */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Attach Report / Code Archive / Document *
          </label>

          <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 transition-all">
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.docx,.zip,.pptx"
              className="hidden"
            />
            {selectedFile ? (
              <div className="flex flex-col items-center gap-1.5">
                <FileCheck className="w-10 h-10 text-emerald-500" />
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {selectedFile.name}
                </span>
                <span className="text-xs text-slate-500">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Click to replace file
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5">
                <UploadCloud className="w-10 h-10 text-indigo-500" />
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Click to select file or drag & drop
                </span>
                <span className="text-xs text-slate-500">
                  Supported formats: PDF, DOCX, ZIP, PPTX (Max: 25MB)
                </span>
              </div>
            )}
          </label>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="mt-3 space-y-1.5">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Uploading artifact...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Submission Notes & Changelog *
          </label>
          <textarea
            rows={3}
            required
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe deliverables achieved, Git commit hash, or responses to previous teacher remarks..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-start gap-2.5 text-xs text-blue-800 dark:text-blue-300">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
          <span>
            This submission creates a timestamped version audit record on the server. Prior versions remain accessible to faculty for plagiarism checks and continuous evaluation.
          </span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!selectedFile || isUploading}
            className="px-5 py-2.5 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-2"
          >
            {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isUploading ? 'Uploading...' : 'Submit Deliverable'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
