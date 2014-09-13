package br.com.agende;

import java.util.List;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.TextView;

public class AppontmentAdapter extends ArrayAdapter<Appointment> {
    private List<Appointment> appointments;

    public AppontmentAdapter(Context context, List<Appointment> appointments) {
        super(context, R.layout.appointment);
        this.appointments = appointments;
    }

    @Override
    public View getView(int position, View convertView, ViewGroup parent) {
        LayoutInflater inflater = (LayoutInflater) getContext().getSystemService(Context.LAYOUT_INFLATER_SERVICE);
        View rowView = inflater.inflate(R.layout.appointment, parent, false);
        TextView timestamp = (TextView) rowView.findViewById(R.id.text_view_timestamp);
        TextView status = (TextView) rowView.findViewById(R.id.text_view_status);
        TextView doctor = (TextView) rowView.findViewById(R.id.text_view_doctor);
        if (appointments.size() > position) {
            final Appointment appointment = appointments.get(position);
            timestamp.setText(appointment.date());
            status.setText(appointment.status());
            doctor.setText(appointment.doctorName());
        }

        return rowView;
    }

    @Override
    public Appointment getItem(int position) {
        if (appointments.size() < position) return null;
        return appointments.get(position);
    }

    @Override
    public int getCount() {
        return appointments.size();
    }
}