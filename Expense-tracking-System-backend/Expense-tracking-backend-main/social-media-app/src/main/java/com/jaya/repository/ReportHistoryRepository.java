package com.jaya.repository;

import com.jaya.models.ReportHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReportHistoryRepository extends JpaRepository<ReportHistory, Integer> {

    /**
     * Find all report history for a specific user
     */
    List<ReportHistory> findByUserIdOrderByCreatedAtDesc(Integer userId);

    /**
     * Find report history by user and status
     */
    List<ReportHistory> findByUserIdAndStatusOrderByCreatedAtDesc(Integer userId, String status);

    /**
     * Find report history by user within a date range
     */
    @Query("SELECT r FROM ReportHistory r WHERE r.userId = :userId AND r.createdAt BETWEEN :startDate AND :endDate ORDER BY r.createdAt DESC")
    List<ReportHistory> findByUserIdAndDateRange(@Param("userId") Integer userId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    /**
     * Find recent report history (last N records)
     */
    List<ReportHistory> findTop10ByUserIdOrderByCreatedAtDesc(Integer userId);

    /**
     * Count successful reports for a user
     */
    long countByUserIdAndStatus(Integer userId, String status);

    /**
     * Find report history by report type
     */
    List<ReportHistory> findByUserIdAndReportTypeOrderByCreatedAtDesc(Integer userId, String reportType);
}
