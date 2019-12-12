package dev.dbagazhkov.javatestregexp.controller;

import dev.dbagazhkov.javatestregexp.ParseModel;
import dev.dbagazhkov.javatestregexp.ParseModelResponse;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.regex.PatternSyntaxException;

@RestController
public class MainController {

    @PostMapping("parse")
    public ParseModelResponse parse(@RequestBody ParseModel parseModel) {
        ParseModelResponse response = new ParseModelResponse();
        if (parseModel.getTemplate() == null) {
            response.setError("Template is null");
        } else if (parseModel.getTemplate().isEmpty()) {
            response.setError("Template is empty");
        } else if (parseModel.getRegex() == null) {
            response.setError("Regex is null");
        } else if (parseModel.getRegex().isEmpty()) {
            response.setError("Regex is empty");
        }
        if (response.getError() == null)
            try {
                response.setAllMatched(parseModel.getTemplate().matches(parseModel.getRegex()));
                final Matcher matcher = Pattern.compile(parseModel.getRegex()).matcher(parseModel.getTemplate());
                response.setResult(getGroups(matcher));

            } catch (PatternSyntaxException e) {
                response.setError(e.getMessage());
            }
        return response;
    }

    public List<String> getGroups(Matcher matcher) {
        List<String> strings = new ArrayList<>();
        while (matcher.find()) {
            for (int j = 0; j <= matcher.groupCount(); j++) {
                strings.add(matcher.group(j));
            }
        }
        return strings;
    }
}
