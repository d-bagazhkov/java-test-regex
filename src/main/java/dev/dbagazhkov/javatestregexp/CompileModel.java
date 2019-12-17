package dev.dbagazhkov.javatestregexp;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.Map;

@Data
public class CompileModel {

    @JsonProperty("template")
    private String script;
    @JsonProperty("context")
    private Map<String, ContextElem> context;

}
