package dev.dbagazhkov.javatestregexp;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class ContextElem {

    @JsonProperty("content")
    private String content;
    @JsonProperty("isArray")
    private boolean isArray;

}
