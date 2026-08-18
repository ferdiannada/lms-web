import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services';
import { ClassRoom } from '../types';
import { ClassHeroBanner } from '../components/features/class-detail/ClassHeroBanner';
import { ClassTabsNav, ClassTabType } from '../components/features/class-detail/ClassTabsNav';
import { ForumTab } from '../components/features/class-detail/tabs/ForumTab';
import { MaterialsTab } from '../components/features/class-detail/tabs/MaterialsTab';
import { AssignmentsTab } from '../components/features/class-detail/tabs/AssignmentsTab';
import { QuizzesTab } from '../components/features/class-detail/tabs/QuizzesTab';
import { MembersTab } from '../components/features/class-detail/tabs/MembersTab';
import { DeleteClassModal } from '../components/features/classes/DeleteClassModal';

export const ClassDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isTeacher = user?.role === 'guru' || user?.role === 'admin';

  const [classDetail, setClassDetail] = useState<ClassRoom | null>(null);
  const [activeTab, setActiveTab] = useState<ClassTabType>('forum');
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const loadClassDetail = useCallback(async (signal?: AbortSignal) => {
    if (!id) return;
    setIsLoading(true);
    try {
      const cls = await api.getClassDetail(id, { signal });
      if (!signal?.aborted) {
        setClassDetail(cls);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        navigate('/classes');
      }
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, [id, navigate]);

  useEffect(() => {
    const controller = new AbortController();
    loadClassDetail(controller.signal);
    return () => {
      controller.abort();
    };
  }, [loadClassDetail]);

  const handleConfirmDeleteClass = async (classId: string) => {
    await api.deleteClass(classId);
    navigate('/classes');
  };

  if (isLoading || !classDetail) {
    return (
      <div className="p-12 text-center text-slate-500 space-y-3 animate-in fade-in">
        <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold">Memuat ruang kelas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in relative pb-12">
      {/* Header Banner */}
      <ClassHeroBanner
        classDetail={classDetail}
        isTeacher={isTeacher}
        onDeleteClick={() => setIsDeleteModalOpen(true)}
      />

      {/* Navigation Tabs */}
      <ClassTabsNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={{
          materials: classDetail.material_count || 0,
          assignments: classDetail.assignment_count || 0,
          quizzes: classDetail.quiz_count || 0,
          members: classDetail.member_count || 0,
        }}
      />

      {/* Tab Contents */}
      <div key={activeTab} className="animate-m3-enter">
        {activeTab === 'forum' && id && (
          <ForumTab
            classId={id}
            user={user}
            isTeacher={isTeacher}
          />
        )}

        {activeTab === 'materi' && id && (
          <MaterialsTab
            classId={id}
            isTeacher={isTeacher}
          />
        )}

        {activeTab === 'tugas' && id && (
          <AssignmentsTab
            classId={id}
            isTeacher={isTeacher}
          />
        )}

        {activeTab === 'kuis' && id && (
          <QuizzesTab
            classId={id}
            isTeacher={isTeacher}
          />
        )}

        {activeTab === 'anggota' && id && (
          <MembersTab classId={id} />
        )}
      </div>

      <DeleteClassModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        classDetail={classDetail}
        onConfirmDelete={handleConfirmDeleteClass}
      />
    </div>
  );
};
