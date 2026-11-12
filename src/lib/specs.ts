const DRIVE_NOTE: Record<string, string> = {
  RWD: "Rear-wheel drive", FWD: "Front-wheel drive", AWD: "All-wheel drive", "4WD": "Four-wheel drive", "6X6": "Six-wheel drive",
};

/** Plain-language label for a drivetrain code (shared by server and client). */
export const driveNote = (d?: string | null) => (d ? DRIVE_NOTE[d.toUpperCase()] : undefined);
