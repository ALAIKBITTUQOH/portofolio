
"use client";

import { Navbar } from "@/components/portfolio/navbar";
import { Hero } from "@/components/portfolio/hero";
import { Stats } from "@/components/portfolio/stats";
import { About } from "@/components/portfolio/about";
import { Skills } from "@/components/portfolio/skills";
import { ProjectsSection } from "@/components/portfolio/projects-section";
import { Contact } from "@/components/portfolio/contact";
import { Footer } from "@/components/portfolio/footer";
import { useProjects } from "@/hooks/use-projects";

/**
 * Halaman tunggal portofolio (Bahasa Indonesia).
 * Data proyek diambil dari /api/projects.
 */
export default function Home() {
  const {
    projects,
    loading,
    error,
    refresh,
    addProject,
    updateProject,
    deleteProject,
  } = useProjects();

  // Menghitung jumlah proyek yang berstatus Selesai
  const completedProjectCount = projects.filter(
    (project) =>
      project.status?.trim().toLowerCase() === "selesai"
  ).length;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Badge jumlah proyek pada foto profil */}
        <Hero projectCount={completedProjectCount} />

        {/* Statistik jumlah proyek selesai */}
        <Stats projectCount={completedProjectCount} />

        <About />

        <Skills />

        <ProjectsSection
          projects={projects}
          loading={loading}
          error={error}
          onRetry={() => void refresh()}
          onCreate={addProject}
          onUpdate={updateProject}
          onDelete={deleteProject}
        />

        <Contact />
      </main>

      <Footer />
    </div>
  );
}
