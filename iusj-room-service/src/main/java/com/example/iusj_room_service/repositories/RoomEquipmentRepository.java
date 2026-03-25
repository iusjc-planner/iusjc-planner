package com.example.iusj_room_service.repositories;

import com.example.iusj_room_service.entities.RoomEquipment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RoomEquipmentRepository extends JpaRepository<RoomEquipment, Long> {

    List<RoomEquipment> findByRoomId(Long roomId);

    List<RoomEquipment> findByResourceId(Long resourceId);

    Optional<RoomEquipment> findByRoomIdAndResourceId(Long roomId, Long resourceId);

    boolean existsByRoomIdAndResourceId(Long roomId, Long resourceId);

    void deleteByRoomIdAndResourceId(Long roomId, Long resourceId);
}
