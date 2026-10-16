package com.educonnect.lesson.domain;

import jakarta.persistence.*;
import java.time.LocalTime;

/** Mapping offering_time_slots; maintainer: Huy. Không chứa logic nghiệp vụ. */
@Entity
@Table(name = "offering_time_slots", uniqueConstraints = {@UniqueConstraint(name = "uq_ots_slot", columnNames = {"offering_id", "weekday", "start_time"})})
public class OfferingTimeSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "offering_id", nullable = false)
    private Long offeringId;

    @Column(name = "weekday", nullable = false)
    private Byte weekday;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "time_zone", nullable = false, length = 64)
    private String timeZone;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "offering_id", referencedColumnName = "id", nullable = false, insertable = false, updatable = false)
    private com.educonnect.lesson.domain.Offering offeringReference;

    protected OfferingTimeSlot() {}

    public static OfferingTimeSlot create() { return new OfferingTimeSlot(); }

    public Long getId() { return id; }

    public Long getOfferingId() { return offeringId; }
    public void setOfferingId(Long offeringId) { this.offeringId = offeringId; }

    public Byte getWeekday() { return weekday; }
    public void setWeekday(Byte weekday) { this.weekday = weekday; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

    public String getTimeZone() { return timeZone; }
    public void setTimeZone(String timeZone) { this.timeZone = timeZone; }

    public com.educonnect.lesson.domain.Offering getOfferingReference() { return offeringReference; }
}
