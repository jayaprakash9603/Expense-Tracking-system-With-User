package com.jaya.repository;

import com.jaya.models.CommonLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommonLogRepository extends JpaRepository<CommonLog, Long> {
}
