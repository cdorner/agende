package br.com.agende;

import static br.com.agende.Hosts.HOST;

import org.androidannotations.annotations.rest.Get;
import org.androidannotations.annotations.rest.Rest;
import org.springframework.http.converter.json.GsonHttpMessageConverter;

@Rest(rootUrl = HOST, converters = { GsonHttpMessageConverter.class })
public interface Client {

    @Get("/mobile/agenda/{patient}")
    public Agenda agenda(String patient);

    @Get("/confirmations/appointment/{appointment}/{token}?status={status}")
    public void confirm(String appointment, String token, String status);
}
