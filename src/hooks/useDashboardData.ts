import { useState, useCallback, useEffect } from 'react';
import { api } from '../services';
import { ClassRoom, Assignment, Quiz, Material } from '../types';

export function useDashboardData() {
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    try {
      // FAST PATH: Load classes and summary concurrently
      const [clsData, summary] = await Promise.all([
        api.getClasses(false, { signal }).catch(() => []),
        api.getDashboardSummary({ signal }).catch(() => ({ pending_assignments: [], active_quizzes: [], recent_materials: [] }))
      ]);

      if (signal?.aborted) return;

      setClasses(clsData);
      setAssignments(summary.pending_assignments || []);
      setQuizzes(summary.active_quizzes || []);
      setMaterials(summary.recent_materials || []);
      
      // Matikan loading segera agar UI langsung tampil (Instan!)
      setIsLoading(false);

      if (clsData.length > 0) {
        // SLOW PATH (Background): Fetch detailed stats per class to update accurate progress bars
        const allAsgs: Assignment[] = [...(summary.pending_assignments || [])];
        const allQzs: Quiz[] = [...(summary.active_quizzes || [])];
        const allMats: Material[] = [...(summary.recent_materials || [])];

        // Fetch in chunks of 3 to avoid overwhelming network
        for (let i = 0; i < clsData.length; i += 3) {
          const chunk = clsData.slice(i, i + 3);
          const results = await Promise.allSettled(
            chunk.map((c) =>
              Promise.allSettled([
                api.getAssignments(c.id, { signal }),
                api.getQuizzes(c.id, { signal }),
                api.getMaterials(c.id, { signal }),
              ])
            )
          );

          if (signal?.aborted) return;

          results.forEach((res) => {
            if (res.status === 'fulfilled') {
              const [asgRes, qzRes, matRes] = res.value;
              if (asgRes.status === 'fulfilled' && Array.isArray(asgRes.value)) allAsgs.push(...asgRes.value);
              if (qzRes.status === 'fulfilled' && Array.isArray(qzRes.value)) allQzs.push(...qzRes.value);
              if (matRes.status === 'fulfilled' && Array.isArray(matRes.value)) allMats.push(...matRes.value);
            }
          });
        }

        // Deduplicate and update state silently
        const uniqueAsgs = Array.from(new Map(allAsgs.map((a) => [a.id, a])).values());
        const uniqueQzs = Array.from(new Map(allQzs.map((q) => [q.id, q])).values());
        const uniqueMats = Array.from(new Map(allMats.map((m) => [m.id, m])).values());

        if (!signal?.aborted) {
          setAssignments(uniqueAsgs);
          setQuizzes(uniqueQzs);
          setMaterials(uniqueMats);
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Failed to fetch dashboard data:', err);
      }
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => {
      controller.abort();
    };
  }, [fetchData]);

  return { classes, assignments, quizzes, materials, isLoading };
}
