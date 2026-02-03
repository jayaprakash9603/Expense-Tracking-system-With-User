package com.jaya.common.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.util.List;

/**
 * Unified pagination response wrapper.
 * Provides consistent pagination structure across all microservices.
 *
 * @param <T> The type of data being returned
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PageResponse<T> {

    /**
     * The paginated content
     */
    private List<T> content;

    /**
     * Current page number (0-indexed)
     */
    private int page;

    /**
     * Number of items per page
     */
    private int size;

    /**
     * Total number of elements across all pages
     */
    private long totalElements;

    /**
     * Total number of pages
     */
    private int totalPages;

    /**
     * Whether this is the first page
     */
    private boolean first;

    /**
     * Whether this is the last page
     */
    private boolean last;

    /**
     * Whether there is a next page
     */
    private boolean hasNext;

    /**
     * Whether there is a previous page
     */
    private boolean hasPrevious;

    /**
     * Number of elements in current page
     */
    private int numberOfElements;

    /**
     * Whether the page is empty
     */
    private boolean empty;

    // ==================== Factory Methods ====================

    /**
     * Create PageResponse from Spring Data Page
     */
    public static <T> PageResponse<T> of(Page<T> page) {
        return PageResponse.<T>builder()
                .content(page.getContent())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .numberOfElements(page.getNumberOfElements())
                .empty(page.isEmpty())
                .build();
    }

    /**
     * Create PageResponse from list with pagination info
     */
    public static <T> PageResponse<T> of(List<T> content, int page, int size, long totalElements) {
        int totalPages = (int) Math.ceil((double) totalElements / size);
        return PageResponse.<T>builder()
                .content(content)
                .page(page)
                .size(size)
                .totalElements(totalElements)
                .totalPages(totalPages)
                .first(page == 0)
                .last(page >= totalPages - 1)
                .hasNext(page < totalPages - 1)
                .hasPrevious(page > 0)
                .numberOfElements(content.size())
                .empty(content.isEmpty())
                .build();
    }

    /**
     * Create an empty PageResponse
     */
    public static <T> PageResponse<T> empty(int page, int size) {
        return PageResponse.<T>builder()
                .content(List.of())
                .page(page)
                .size(size)
                .totalElements(0)
                .totalPages(0)
                .first(true)
                .last(true)
                .hasNext(false)
                .hasPrevious(false)
                .numberOfElements(0)
                .empty(true)
                .build();
    }

    /**
     * Wrap this PageResponse in an ApiResponse
     */
    public ApiResponse<PageResponse<T>> toApiResponse() {
        return ApiResponse.success(this);
    }

    /**
     * Wrap this PageResponse in an ApiResponse with custom message
     */
    public ApiResponse<PageResponse<T>> toApiResponse(String message) {
        return ApiResponse.success(this, message);
    }
}
