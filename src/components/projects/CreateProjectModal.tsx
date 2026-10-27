import React, { useState } from 'react';
import { Plus, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { Milestone } from '../../types';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose
}) => {
  const { subjects, groups, addProject } = useApp();

  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState(
    'Submit IEEE formatted reports. Upload working video links and GitHub commit tags for every prototype deliverable.'
  );
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);

  const [milestones, setMilestones] = useState<
    Omit<Milestone, 'id' | 'projectId' | 'orderIndex'>[]
  >([
    {
      title: 'Problem Synopsis & Feasibility Proposal',
      description: 'Literature review of 10 IEEE papers, block diagram, and hardware BOM estimation.',
      deadline: '2026-08-30T23:59:59Z',
      weightage: 15,
      requiresFile: true
    },
    {
      title: 'System Architecture & Database Design',
      description: 'ER diagram, UML sequence diagrams, and API specification.',
      deadline: '2026-09-30T23:59:59Z',
      weightage: 20,
      requiresFile: true
    },
    {
      title: 'Core Implementation & Prototype Demo',
      description: 'Working code repository, microservices, and live demo recording.',
      deadline: '2026-10-31T23:59:59Z',
      weightage: 35,
      requiresFile: true
    },
    {
      title: 'Testing, Security Audit & Verification',
      description: 'Automated test suite, security scan, and performance benchmark.',
      deadline: '2026-11-15T23:59:59Z',
      weightage: 15,
      requiresFile: true
    },
    {
      title: 'Final Report & External Viva Voce',
      description: 'University standard project report and live defense examination.',
      deadline: '2026-11-30T23:59:59Z',
      weightage: 15,
      requiresFile: true
    }
  ]);

  const totalWeightage = milestones.reduce((sum, m) => sum + (Number(m.weightage) || 0), 0);
  const isWeightageValid = totalWeightage === 100;

  const handleAddMilestone = () => {
    setMilestones([
      ...milestones,
      {
        title: `Milestone ${milestones.length + 1}`,
        description: 'Deliverable specification...',
        deadline: new Date(Date.now() + 1000 * 3600 * 24 * 14).toISOString().slice(0, 10),
        weightage: 10,
        requiresFile: true
      }
    ]);
  };

  const handleRemoveMilestone = (index: number) => {
    if (milestones.length <= 1) return;
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleMilestoneChange = (
    index: number,
    field: keyof Omit<Milestone, 'id' | 'projectId' | 'orderIndex'>,
    value: any
  ) => {
    const updated = [...milestones];
    updated[index] = { ...updated[index], [field]: value };
    setMilestones(updated);
  };

  const toggleGroupSelection = (groupId: string) => {
    setSelectedGroupIds((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subjectId) return;

    const selectedSubject = subjects.find((s) => s.id === subjectId);
    if (!selectedSubject) return;

    const formattedMilestones: Milestone[] = milestones.map((m, idx) => ({
      ...m,
      id: `ms_${Date.now()}_${idx}`,
      projectId: '',
      orderIndex: idx + 1,
      weightage: Number(m.weightage) || 0
    }));

    addProject(
      {
        subjectId,
        subjectCode: selectedSubject.code,
        subjectName: selectedSubject.name,
        title,
        description,
        instructions,
        milestones: formattedMilestones,
        assignedGroupIds: selectedGroupIds,
        weightageTotal: totalWeightage
      },
      selectedGroupIds
    );

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Capstone Project"
      subtitle="Define curriculum milestones, deadline rubric weightages, and assign to student groups."
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Project Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., AI-Powered Smart Traffic Signal Control with Computer Vision"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Associated Subject *
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.code} — {sub.name} ({sub.semester})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Rubric Total Weightage
            </label>
            <div
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-sm font-bold ${
                isWeightageValid
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
              }`}
            >
              {isWeightageValid ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600" />
              )}
              <span>Total: {totalWeightage}% / 100%</span>
              {!isWeightageValid && (
                <span className="text-xs font-normal">
                  ({100 - totalWeightage > 0 ? `+${100 - totalWeightage}% needed` : `${totalWeightage - 100}% over`})
                </span>
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Project Description & Scope
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline the core engineering problem and expected outcomes..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Evaluation Guidelines & Instructions
            </label>
            <textarea
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Milestone Configuration */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Project Milestones & Deadlines ({milestones.length})</span>
            </h4>
            <button
              type="button"
              onClick={handleAddMilestone}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Milestone</span>
            </button>
          </div>

          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
            {milestones.map((m, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 grid grid-cols-12 gap-2.5 items-center"
              >
                <div className="col-span-5">
                  <input
                    type="text"
                    required
                    value={m.title}
                    onChange={(e) => handleMilestoneChange(idx, 'title', e.target.value)}
                    placeholder="Milestone title"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="col-span-4">
                  <input
                    type="date"
                    required
                    value={m.deadline.slice(0, 10)}
                    onChange={(e) =>
                      handleMilestoneChange(idx, 'deadline', new Date(e.target.value).toISOString())
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="col-span-2 flex items-center gap-1">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={m.weightage}
                    onChange={(e) =>
                      handleMilestoneChange(idx, 'weightage', parseInt(e.target.value) || 0)
                    }
                    className="w-16 px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs text-center font-bold bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                  <span className="text-xs text-slate-500 font-semibold">%</span>
                </div>
                <div className="col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleRemoveMilestone(idx)}
                    disabled={milestones.length <= 1}
                    className="p-1.5 text-slate-400 hover:text-rose-500 disabled:opacity-30 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Multi-Group Assignment */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Assign to Student Groups ({selectedGroupIds.length} selected)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto">
            {groups.map((group) => {
              const isSelected = selectedGroupIds.includes(group.id);
              return (
                <div
                  key={group.id}
                  onClick={() => toggleGroupSelection(group.id)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-indigo-50 border-indigo-300 dark:bg-indigo-950/40 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div>
                    <p className="font-bold">{group.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Leader: {group.leaderName}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isWeightageValid}
            className="px-5 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            Create & Assign Project
          </button>
        </div>
      </form>
    </Modal>
  );
};
