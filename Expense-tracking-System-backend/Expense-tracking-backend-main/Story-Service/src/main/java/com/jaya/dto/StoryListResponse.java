package com.jaya.dto;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoryListResponse {
    private List<StoryDTO> stories;
    private Integer totalCount;
    private Integer unseenCount;
    private Boolean hasMore;
}
