package com.example.iusj_room_service.repositories;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.iusj_room_service.entities.RoomReservation;

public interface RoomReservationRepository extends JpaRepository<RoomReservation, Long> {

    List<RoomReservation> findByRoomId(Long roomId);

    @Query("SELECT DISTINCT r.roomId FROM RoomReservation r WHERE r.status IN :statuses AND r.startTime < :endTime AND r.endTime > :startTime")
    List<Long> findReservedRoomIds(@Param("statuses") List<RoomReservation.Status> statuses,
                                   @Param("startTime") LocalDateTime startTime,
                                   @Param("endTime") LocalDateTime endTime);

        @Query("SELECT (COUNT(r) > 0) FROM RoomReservation r " +
            "WHERE r.roomId = :roomId AND r.status IN :statuses " +
            "AND r.startTime < :endTime AND r.endTime > :startTime")
        boolean existsConflict(@Param("roomId") Long roomId,
                      @Param("statuses") List<RoomReservation.Status> statuses,
                      @Param("startTime") LocalDateTime startTime,
                      @Param("endTime") LocalDateTime endTime);
}
