package com.jaya.repository;

import com.jaya.models.MomentumInsight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MomentumInsightRepository extends JpaRepository<MomentumInsight, Long> {

    Optional<MomentumInsight> findByUserIdAndComputedDate(Integer userId, LocalDate computedDate);

    @Modifying
    @Query("DELETE FROM MomentumInsight m WHERE m.computedDate < :date")
    int deleteByComputedDateBefore(@Param("date") LocalDate date);
}
