"use client";

import { useCallback, useEffect, useState } from "react";

import type { Project, ProjectFormValues } from "@/lib/types";

interface UseProjectsReturn {
  projects: Project[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addProject: (values: ProjectFormValues) => Promise<Project>;
  updateProject: (id: string, values: ProjectFormValues) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
}

/**
 * Hook data untuk resource /api/projects.
 * Menangani fetch awal, create, update, dan delete + sinkronisasi state lokal.
 * Melempar Error (dengan pesan dari API) bila request gagal —
 * pemanggil cukup menangkap untuk menampilkan toast.
 */
export function useProjects(): UseProjectsReturn {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/projects", {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
      const data: { projects?: Project[]; error?: string } = await res
        .json()
        .catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `Permintaan gagal (HTTP ${res.status})`);
      }
      if (!Array.isArray(data.projects)) {
        throw new Error("Respons server tidak berisi daftar proyek yang valid.");
      }
      setProjects(data.projects);
    } catch (cause) {
      console.error("Gagal memuat proyek:", cause);
      setError(
        cause instanceof Error
          ? cause.message
          : "Gagal memuat proyek. Periksa server dan koneksi database."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addProject = useCallback(async (values: ProjectFormValues) => {
    const res = await fetch("/api/projects", {
      cache: "no-store",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data: { project?: Project; error?: string } = await res
      .json()
      .catch(() => ({}));
    if (!res.ok || !data.project) {
      throw new Error(data.error || "Gagal menambahkan proyek");
    }
    setProjects((prev) => [data.project as Project, ...prev]);
    return data.project;
  }, []);

  const updateProject = useCallback(
    async (id: string, values: ProjectFormValues) => {
      const res = await fetch(`/api/projects/${id}`, {
        cache: "no-store",
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data: { project?: Project; error?: string } = await res
        .json()
        .catch(() => ({}));
      if (!res.ok || !data.project) {
        throw new Error(data.error || "Gagal memperbarui proyek");
      }
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? (data.project as Project) : p))
      );
      return data.project;
    },
    []
  );

  const deleteProject = useCallback(async (id: string) => {
    const res = await fetch(`/api/projects/${id}`, {
      cache: "no-store",
      method: "DELETE",
    });
    const data: { success?: boolean; error?: string } = await res
      .json()
      .catch(() => ({}));
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Gagal menghapus proyek");
    }
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return {
    projects,
    loading,
    error,
    refresh,
    addProject,
    updateProject,
    deleteProject,
  };
}
