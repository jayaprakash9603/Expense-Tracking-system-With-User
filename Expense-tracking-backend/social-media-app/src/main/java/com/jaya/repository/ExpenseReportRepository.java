package com.jaya.repository;

import com.jaya.models.ExpenseReport;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExpenseReportRepository extends JpaRepository<ExpenseReport, Integer> {
}
