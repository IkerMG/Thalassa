package com.thalassa.backend.config;

import com.thalassa.backend.models.User;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.UUID;
import org.slf4j.MDC;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class MdcLoggingFilter extends OncePerRequestFilter {

  private static final String TRACE_ID = "traceId";
  private static final String USER_ID = "userId";

  @Override
  protected void doFilterInternal(
      @NonNull HttpServletRequest request,
      @NonNull HttpServletResponse response,
      @NonNull FilterChain filterChain)
      throws ServletException, IOException {

    try {
      MDC.put(TRACE_ID, UUID.randomUUID().toString().replace("-", "").substring(0, 16));

      Authentication auth = SecurityContextHolder.getContext().getAuthentication();
      if (auth != null && auth.getPrincipal() instanceof User user) {
        MDC.put(USER_ID, String.valueOf(user.getId()));
      }

      // Expone el traceId en la respuesta para correlación en el cliente
      response.setHeader("X-Trace-Id", MDC.get(TRACE_ID));

      filterChain.doFilter(request, response);
    } finally {
      MDC.remove(TRACE_ID);
      MDC.remove(USER_ID);
    }
  }
}
