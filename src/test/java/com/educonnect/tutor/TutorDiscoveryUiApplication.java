package com.educonnect.tutor;

import com.educonnect.common.reference.domain.*;
import com.educonnect.lesson.domain.Offering;
import com.educonnect.lesson.domain.OfferingTimeSlot;
import com.educonnect.security.AccountUserDetailsService;
import com.educonnect.security.DatabaseSecurityConfig;
import com.educonnect.tutor.domain.*;
import com.educonnect.tutor.repository.TutorDiscoveryRepository;
import com.educonnect.tutor.service.PublicTutorProfileService;
import com.educonnect.tutor.service.TutorDiscoveryService;
import com.educonnect.tutor.web.TutorDiscoveryPageController;
import com.educonnect.user.UserAccountRepository;
import com.educonnect.user.domain.Role;
import com.educonnect.user.domain.UserAccount;
import com.educonnect.user.domain.UserRole;
import com.educonnect.web.PageModelAdvice;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.orm.jpa.persistenceunit.PersistenceManagedTypes;
import org.springframework.orm.jpa.SharedEntityManagerCreator;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;

import javax.sql.DataSource;
import java.util.stream.Stream;
import java.time.LocalTime;

/** Máy chủ kiểm thử UI dùng controller/service/repository thật và H2 cô lập; không chạy trong ứng dụng chính. */
@Configuration(proxyBeanMethods = false)
@Profile("discovery-ui-test")
@EnableAutoConfiguration
@Import({TutorDiscoveryPageController.class, TutorDiscoveryService.class, PublicTutorProfileService.class,
        TutorDiscoveryRepository.class, PageModelAdvice.class, DatabaseSecurityConfig.class,
        AccountUserDetailsService.class, UserAccountRepository.class})
public class TutorDiscoveryUiApplication {
    @Bean WebServerFactoryCustomizer<TomcatServletWebServerFactory> reviewServerProtocol() {
        return server -> server.setProtocol("org.apache.coyote.http11.Http11Nio2Protocol");
    }

    @Bean EntityManager discoveryEntityManager(EntityManagerFactory factory) {
        return SharedEntityManagerCreator.createSharedEntityManager(factory);
    }

    @Bean PersistenceManagedTypes discoveryEntities() {
        return PersistenceManagedTypes.of(Stream.of(UserAccount.class, TutorProfile.class, Subject.class,
                GradeLevel.class, Area.class, DeliveryMode.class, TutorSubject.class, TutorGradeLevel.class,
                TutorArea.class, TutorDeliveryMode.class, Offering.class, OfferingTimeSlot.class,
                Role.class, UserRole.class).map(Class::getName).toArray(String[]::new));
    }

    @Bean ApplicationRunner discoveryFixtures(DataSource dataSource, EntityManager em, PlatformTransactionManager transactions) {
        return args -> {
            new ResourceDatabasePopulator(new ClassPathResource("tutor-discovery-ui.sql")).execute(dataSource);
            // Lưu giờ bằng cùng mapping Hibernate như TutorOfferingService, bao gồm cấu hình JDBC time_zone.
            new TransactionTemplate(transactions).executeWithoutResult(status -> {
                for (int i = 0; i < 2; i++) {
                    OfferingTimeSlot slot = OfferingTimeSlot.create();
                    slot.setOfferingId(201L + i);
                    slot.setWeekday((byte) (i + 1));
                    slot.setStartTime(LocalTime.of(i == 0 ? 8 : 18, 0));
                    slot.setEndTime(LocalTime.of(i == 0 ? 9 : 19, 0));
                    slot.setTimeZone("Asia/Ho_Chi_Minh");
                    em.persist(slot);
                }
            });
        };
    }

    public static void main(String[] args) {
        SpringApplication.run(TutorDiscoveryUiApplication.class,
                "--spring.profiles.active=db-dev,discovery-ui-test", "--server.port=18081", "--server.address=127.0.0.1");
    }
}
