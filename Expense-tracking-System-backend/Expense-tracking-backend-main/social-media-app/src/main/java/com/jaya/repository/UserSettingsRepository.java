package com.jaya.repository;

import com.jaya.models.UserSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;












@Repository
public interface UserSettingsRepository extends JpaRepository<UserSettings, Long> {

    






    @Query("SELECT us FROM UserSettings us WHERE us.userId = :userId")
    Optional<UserSettings> findByUserId(@Param("userId") Integer userId);

    






    @Query("SELECT CASE WHEN COUNT(us) > 0 THEN true ELSE false END FROM UserSettings us WHERE us.userId = :userId")
    boolean existsByUserId(@Param("userId") Integer userId);

    





    @Modifying
    @Transactional
    @Query("DELETE FROM UserSettings us WHERE us.userId = :userId")
    void deleteByUserId(@Param("userId") Integer userId);

    






    @Query("SELECT us FROM UserSettings us WHERE us.themeMode = :themeMode")
    java.util.List<UserSettings> findByThemeMode(@Param("themeMode") String themeMode);

    





    @Query("SELECT us FROM UserSettings us WHERE us.emailNotifications = true")
    java.util.List<UserSettings> findUsersWithEmailNotificationsEnabled();

    





    @Query("SELECT us FROM UserSettings us WHERE us.weeklyReports = true")
    java.util.List<UserSettings> findUsersWithWeeklyReportsEnabled();
}
