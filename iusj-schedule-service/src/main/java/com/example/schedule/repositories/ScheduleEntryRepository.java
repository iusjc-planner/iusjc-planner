package com.example.schedule.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.example.schedule.entities.ScheduleEntry;

public interface ScheduleEntryRepository extends JpaRepository<ScheduleEntry, Long>, JpaSpecificationExecutor<ScheduleEntry> {

	long countByStatus(SessionStatus status);
}
