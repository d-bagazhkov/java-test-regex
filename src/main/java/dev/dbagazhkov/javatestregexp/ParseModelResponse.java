package dev.dbagazhkov.javatestregexp;

import lombok.Data;

import java.util.List;

@Data
public class ParseModelResponse {

    private boolean allMatched;
    private String error;
    private List<String> result;

}
