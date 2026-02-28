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

    


    List<ReportHistory> findByUserIdOrderByCreatedAtDesc(Integer userId);

    


    List<ReportHistory> findByUserIdAndStatusOrderByCreatedAtDesc(Integer userId, String status);

    


    @Query("SELECT r FROM ReportHistory r WHERE r.userId = :userId AND r.createdAt BETWEEN :startDate AND :endDate ORDER BY r.createdAt DESC")
    List<ReportHistory> findByUserIdAndDateRange(@Param("userId") Integer userId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    


    List<ReportHistory> findTop10ByUserIdOrderByCreatedAtDesc(Integer userId);

    


    long countByUserIdAndStatus(Integer userId, String status);

    


    List<ReportHistory> findByUserIdAndReportTypeOrderByCreatedAtDesc(Integer userId, String reportType);
}
