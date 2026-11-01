package com.smartration.repository;

import com.smartration.entity.Complaint;
import com.smartration.entity.enums.ComplaintStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    Optional<Complaint> findByComplaintNumber(String complaintNumber);
    List<Complaint> findByBeneficiaryUserIdOrderByCreatedAtDesc(Long beneficiaryUserId);
    Page<Complaint> findByShopIdOrderByCreatedAtDesc(Long shopId, Pageable pageable);
    List<Complaint> findByStatus(ComplaintStatus status);
}
