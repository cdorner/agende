package br.com.agende;

public class Appointment {

    private String _id;
    private String confirmationToken;
    private Patient patient;
    private String date;
    private String status;
    private Metadata metadata;

    public String date() {
        return date;
    }

    public String status() {
        return status;
    }

    public String doctorName() {
        return metadata.doctorName();
    }

    public String id() {
        return _id;
    }

    public String token() {
        return confirmationToken;
    }
}
