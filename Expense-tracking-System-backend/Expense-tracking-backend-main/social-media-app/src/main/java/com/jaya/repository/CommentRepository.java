package com.jaya.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jaya.models.Comment;

public interface CommentRepository extends JpaRepository<Comment, Integer> {

}
