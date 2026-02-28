package com.jaya.repository;

import com.jaya.models.AdminReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AdminReportRepository extends JpaRepository<AdminReport, Long> {

    Page<AdminReport> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<AdminReport> findByTypeOrderByCreatedAtDesc(String type, Pageable pageable);

    Page<AdminReport> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);

    Page<AdminReport> findByGeneratedByOrderByCreatedAtDesc(Long generatedBy, Pageable pageable);

    @Query("SELECT r FROM AdminReport r WHERE r.createdAt >= :since ORDER BY r.createdAt DESC")
    Page<AdminReport> findReportsSince(@Param("since") LocalDateTime since, Pageable pageable);

    @Query("SELECT COUNT(r) FROM AdminReport r WHERE r.createdAt >= :since")
    long countReportsSince(@Param("since") LocalDateTime since);

    List<AdminReport> findByStatusIn(List<String> statuses);

    @Query("SELECT r.type, COUNT(r) FROM AdminReport r GROUP BY r.type")
    List<Object[]> countByType();
}
