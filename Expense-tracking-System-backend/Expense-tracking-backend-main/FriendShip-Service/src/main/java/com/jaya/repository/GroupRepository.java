package com.jaya.repository;

import com.jaya.models.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupRepository extends JpaRepository<Group, Integer> {

    List<Group> findByCreatedBy(Integer userId);

    @Query("SELECT g FROM Group g JOIN g.memberIds m WHERE m = :userId")
    List<Group> findGroupsByMemberId(@Param("userId") Integer userId);

    @Query("SELECT g FROM Group g WHERE g.createdBy = :userId OR :userId MEMBER OF g.memberIds")
    List<Group> findAllUserGroups(@Param("userId") Integer userId);

    boolean existsByNameAndCreatedBy(String name, Integer createdBy);
}