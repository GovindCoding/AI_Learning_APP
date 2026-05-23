package com.ailearning.tracker.learningservice.repository;

import com.ailearning.tracker.learningservice.model.DailyLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DailyLogRepository extends JpaRepository<DailyLog, Long> {
    List<DailyLog> findByUserIdAndLogDateBetween(Long userId, LocalDate startDate, LocalDate endDate);
    Optional<DailyLog> findByUserIdAndLogDate(Long userId, LocalDate logDate);
}
