// src/main/java/org/example/backend/utils/IDGenerator.java
package org.example.backend.util;

import org.springframework.stereotype.Component;

@Component
public class IDGenerator {

    /**
     * Generates a new ID based on the last ID, prefix, and total digits.
     *
     * @param lastId The last used ID (e.g., "PA003")
     * @param prefix The prefix for the ID (e.g., "PA")
     * @param digits The number of digits for the numeric part (e.g., 3)
     * @return The next ID in sequence (e.g., "PA004")
     */
    public String generateID(String lastId, String prefix, int digits) {
        try {
            // If lastId is empty or null, start with first ID
            if (lastId == null || lastId.isEmpty()) {
                return prefix + String.format("%0" + digits + "d", 1);
            }

            // If lastId doesn't start with prefix, start with first ID
            if (!lastId.startsWith(prefix)) {
                return prefix + String.format("%0" + digits + "d", 1);
            }

            // Extract numeric part after prefix
            String numberPart = lastId.substring(prefix.length());
            int nextNumber = Integer.parseInt(numberPart) + 1;

            return prefix + String.format("%0" + digits + "d", nextNumber);
        } catch (Exception e) {
            // If any error occurs, start with first ID
            return prefix + String.format("%0" + digits + "d", 1);
        }
    }
}