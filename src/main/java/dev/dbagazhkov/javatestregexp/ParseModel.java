package dev.dbagazhkov.javatestregexp;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class ParseModel {

    @JsonProperty("regex")
    private String regex;

    @JsonProperty("template")
    private String template;

}
