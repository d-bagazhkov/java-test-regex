package dev.dbagazhkov.javatestregexp.controller;

import com.hubspot.jinjava.Jinjava;
import com.hubspot.jinjava.interpret.FatalTemplateErrorsException;
import com.hubspot.jinjava.interpret.TemplateError;
import dev.dbagazhkov.javatestregexp.CompileModel;
import dev.dbagazhkov.javatestregexp.CompileModelResponse;
import dev.dbagazhkov.javatestregexp.ParseModel;
import dev.dbagazhkov.javatestregexp.ParseModelResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.regex.PatternSyntaxException;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@RestController
@RequiredArgsConstructor
public class MainController {

    private final Jinjava jinjava;

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

    private List<String> getGroups(Matcher matcher) {
        List<String> strings = new ArrayList<>();
        while (matcher.find()) {
            for (int j = 0; j <= matcher.groupCount(); j++) {
                strings.add(matcher.group(j));
            }
        }
        return strings;
    }

    @PostMapping("compile")
    public CompileModelResponse compile(@RequestBody CompileModel compileModel) {
        final Map<String, Object> context = compileModel.getContext().entrySet().stream()
                .map(e -> contextEntry(e.getKey().trim(), e.getValue().isArray() ? parseToList(e.getValue().getContent()) : e.getValue().getContent()))
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
        final String result = debugRender(compileModel.getScript(), context);
        final CompileModelResponse compileModelResponse = new CompileModelResponse();
        compileModelResponse.setResult(result);
        return compileModelResponse;
    }

    private Map.Entry<String, Object> contextEntry(String k, Object v) {
        return new AbstractMap.SimpleEntry<>(k, v);
    }

    private List<String> parseToList(String str) {
        if (str == null || str.isEmpty()) return Collections.emptyList();
        return Arrays.asList(str.replaceAll("\\s+", " ").split(" "));
    }

    private String getErrorMessage(FatalTemplateErrorsException e) {
        return StreamSupport.stream(e.getErrors().spliterator(), false)
                .map(TemplateError::getMessage)
                .collect(Collectors.joining("\n"));
    }

    private String debugRender(String beforeRender, Map<String, Object> context) {
        try {
            return render(beforeRender, context);
        } catch (FatalTemplateErrorsException e) {
            return getErrorMessage(e);
        }
    }

    private String render(String beforeRender, Map<String, Object> context) {
        return jinjava.render(beforeRender, context);
    }
}
