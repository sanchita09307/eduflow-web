import React, { useState } from 'react';
import { Award, Calculator, Download, CheckCircle2, RotateCcw } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { StudentGroup } from '../../types';

interface VivaCalculatorModalProps {
  group: StudentGroup | null;
  isOpen: boolean;
  onClose: () => void;
  onExportCsv?: () => void;
}

export const VivaCalculatorModal: React.FC<VivaCalculatorModalProps> = ({
  group,
  isOpen,
  onClose,
  onExportCsv
}) => {
  const [rubricScores, setRubricScores] = useState({
    synopsis: 14, // Max 15
    architecture: 18, // Max 20
    prototype: 31, // Max 35
    qaPlagiarism: 14, // Max 15
    individualDefense: 13 // Max 15
  });

  if (!group) return null;

  const totalScore =
    rubricScores.synopsis +
    rubricScores.architecture +
    rubricScores.prototype +
    rubricScores.qaPlagiarism +
    rubricScores.individualDefense;

  const getLetterGrade = (marks: number) => {
    if (marks >= 90) return { grade: 'O (Outstanding)', points: 10, variant: 'success' as const };
    if (marks >= 80) return { grade: 'A+ (Excellent)', points: 9, variant: 'success' as const };
    if (marks >= 70) return { grade: 'A (Very Good)', points: 8, variant: 'primary' as const };
    if (marks >= 60) return { grade: 'B+ (Good)', points: 7, variant: 'primary' as const };
    if (marks >= 50) return { grade: 'B (Above Average)', points: 6, variant: 'warning' as const };
    return { grade: 'RA (Re-Appear / Deficient)', points: 0, variant: 'danger' as const };
  };

  const gradeInfo = getLetterGrade(totalScore);

  const handleDownloadTabulation = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        'College,Indian Institute of Engineering & Technology',
        'Academic Year,2026-2027 Even Semester',
        `Subject,${group.subjectCode}`,
        `Group,${group.name}`,
        `Project,${group.projectTitle}`,
        '',
        'Evaluation Parameter,Max Marks,Awarded Marks',
        `Synopsis & Literature Survey,15,${rubricScores.synopsis}`,
        `System Architecture & Schema,20,${rubricScores.architecture}`,
        `Live Prototype & Edge Demo,35,${rubricScores.prototype}`,
        `QA Test Coverage & Plagiarism,15,${rubricScores.qaPlagiarism}`,
        `Individual Viva Voce Defense,15,${rubricScores.individualDefense}`,
        `TOTAL MARKS,100,${totalScore}`,
        `LETTER GRADE,,${gradeInfo.grade}`,
        `GRADE POINT,,${gradeInfo.points}`,
        '',
        'Student Name,Roll Number,Individual Viva Marks,Status',
        ...group.members.map(
          (m) =>
            `${m.name},${m.rollNumber},${rubricScores.individualDefense + (m.roleInGroup === 'leader' ? 1 : 0)},QUALIFIED`
        )
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Viva_Tabulation_${group.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Continuous Viva Marks & Tabulation Simulator"
      subtitle={`${group.name} — Interactive University Viva Defense Rubric`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Dynamic Total & Grade Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 text-white flex flex-wrap items-center justify-between gap-4 shadow-lg">
          <div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block">
              Cumulative Defense Score
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black">{totalScore}</span>
              <span className="text-xs text-slate-400">/ 100 Marks</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              University Grade
            </span>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={gradeInfo.variant} size="md">
                {gradeInfo.grade}
              </Badge>
              <span className="text-xs font-bold font-mono text-indigo-300">
                GP: {gradeInfo.points}.0
              </span>
            </div>
          </div>
        </div>

        {/* Sliders for continuous rubric components */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-slate-700 dark:text-slate-300">
                1. Synopsis, Problem Statement & Feasibility
              </span>
              <span className="text-indigo-600 dark:text-indigo-400">
                {rubricScores.synopsis} / 15 Marks
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              value={rubricScores.synopsis}
              onChange={(e) =>
                setRubricScores({ ...rubricScores, synopsis: Number(e.target.value) })
              }
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-slate-700 dark:text-slate-300">
                2. System Architecture, UML & Database Design
              </span>
              <span className="text-indigo-600 dark:text-indigo-400">
                {rubricScores.architecture} / 20 Marks
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              value={rubricScores.architecture}
              onChange={(e) =>
                setRubricScores({ ...rubricScores, architecture: Number(e.target.value) })
              }
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-slate-700 dark:text-slate-300">
                3. Working Prototype, Edge Sensors & Microservices
              </span>
              <span className="text-indigo-600 dark:text-indigo-400">
                {rubricScores.prototype} / 35 Marks
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="35"
              value={rubricScores.prototype}
              onChange={(e) =>
                setRubricScores({ ...rubricScores, prototype: Number(e.target.value) })
              }
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-slate-700 dark:text-slate-300">
                4. Automated QA, Test Coverage & IEEE Compliance
              </span>
              <span className="text-indigo-600 dark:text-indigo-400">
                {rubricScores.qaPlagiarism} / 15 Marks
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              value={rubricScores.qaPlagiarism}
              onChange={(e) =>
                setRubricScores({ ...rubricScores, qaPlagiarism: Number(e.target.value) })
              }
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-slate-700 dark:text-slate-300">
                5. Oral Defense & Individual Q&A
              </span>
              <span className="text-indigo-600 dark:text-indigo-400">
                {rubricScores.individualDefense} / 15 Marks
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              value={rubricScores.individualDefense}
              onChange={(e) =>
                setRubricScores({ ...rubricScores, individualDefense: Number(e.target.value) })
              }
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() =>
              setRubricScores({
                synopsis: 14,
                architecture: 18,
                prototype: 31,
                qaPlagiarism: 14,
                individualDefense: 13
              })
            }
            className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadTabulation}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV Tabulation Sheet</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
