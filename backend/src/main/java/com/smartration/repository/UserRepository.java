package com.smartration.repository;

import com.smartration.entity.User;
import com.smartration.entity.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByRationCardId(Long rationCardId);
    boolean existsByUsername(String username);
    List<User> findByShopId(Long shopId);
    List<User> findByRole(Role role);
}
